#!/usr/bin/env bb --verbose
;(def dry-run? true)
(def dry-run? false)

(defn escape-title [f line]
    (if-let [[_ start title] (re-matches #"(\s*\{?:title) \"(.*(?<!\\)\".*)\"" line)]
      (do
        (println (.getPath f) ": escaping \" in the title" title)
        (str start " \"" (str/replace title #"(?<!\\)\"" "\\\\\"") "\""))
      line))

(defn once
  ([f] (once f #()))
  ([f cb]
   (let [done? (atom false)]
     (fn [x]
       (if @done?
         x
         (let [x' (f x)]
           (when (not= x' x)
             (reset! done? true)
             (cb))
           x'))))))

(defn ftype [f]
  (if (re-matches #"(^|.*/)pages($|/.*)" (.getParent f))
    :page
    :post))

(defn metadata+content-lines [f lines]
  (let [[metadata-start [last-md & content]]
        (split-with
         #(not (re-matches #"^}\s*$" %))
         lines)

        md
        (->> (concat metadata-start [last-md])
             (map (partial escape-title f))
             (apply str)
             (edn/read-string))]
    [md content]))

(defn update-metadata [md {:keys [draft? layout page-index]}]
  (cond-> md
          draft? (assoc :draft? true)
          layout (assoc :layout layout)
          page-index (assoc :page-index (Integer/parseInt page-index)
                            :navbar?    true)))

(defn fill-metadata [f opts lines]
  (let [[md content-lines] (metadata+content-lines f lines)
        md-str (-> (prn-str (update-metadata md opts))
                   (str/replace #"\}$" "\n}"))]
    (cons md-str content-lines)))

(defn fix-file-content!
  ([f] (fix-file-content! f nil))
  ([f {:keys [page-index draft?]}]
   (assert (and f (.getPath f)) "Not a file?!")
   (let [opts (cond-> {}
                      ;;:layout (ftype f)
                      page-index (assoc :page-index page-index, :navbar true)
                      draft? (assoc :draft? true))
         f' (io/file (.getParentFile f) (str (.getName f) ".tmp"))]
     (with-open [rdr (io/reader f)
                 wrt (io/writer (.getPath f'))]
       (->> (line-seq rdr)
            (fill-metadata f opts)
            (run! #(.write wrt (str % "\n")))))
     (when-not dry-run?
       (or (.renameTo f' f) (throw (Exception. (str "Rename failed: " f')))))
     f)))

(defn rename-with! [f fn]
  (let [n (.getName f)
        n' (fn n)
        f' (io/file (.getParentFile f) n')
        rename! (if dry-run?
                    (constantly f)
                    #(do
                       (assert (.exists f) (str "The source file does not exist! " (.getAbsolutePath f)))
                       (or (.renameTo f f')
                           (throw (Exception. (str "renameTo failed for " f " -> " f'))))
                       f'))]
    (if (= n n')
      f
      (do
        (println "Rename" (.getPath f) "->" n')
        (rename!)))))

(defn move! [f path]
  (println "Move" (.getPath f) "->" path)
  (let [f' (io/file path)
        p' (.toPath f')
        target-dir (.toFile (.getParent p'))]
    (when-not dry-run?
      (when-not (.exists target-dir)
        (shell/sh "mkdir" "-p" (.getPath target-dir)))
      (shell/sh "mv" "-f" (.getPath f) (.getPath f')))
    #_(java.nio.file.Files/createDirectories
       (.getParent p')
       (into-array java.nio.file.attribute.FileAttribute []))
    #_(java.nio.file.Files/move
       (.toPath f)
       p'
       (into-array java.nio.file.CopyOption
                   [java.nio.file.StandardCopyOption/REPLACE_EXISTING]))
    f'))

(defn fix-page! [f]
  ;; FIXME Rename About to Me - both directory and :title in index.asc
  (let [path (.getPath f)
        [_ page-index] (re-matches #"(?:^|.*/)pages/(\d+)--(?:.*)" path)
        add-to-nav?    (re-matches #"(?:^|.*/)pages/(?:\d+)--(([^/]+)|(.*/index(\.md)?\.asc))" (.getPath f))
        new-path (when page-index
                   (str/replace-first path (str page-index "--") ""))]
    (println :path path :add-to-nav? add-to-nav?)
    (cond-> (fix-file-content! f (when add-to-nav? {:page-index page-index}))
            new-path (move! new-path))))

(defn fix-post! [f]
  ;; FIXME Move date from file name into metadata so that we keep the old root URLs
  (let [draft? (not (re-find #"^\d{4}-\d{2}-\d{2}--?" (.getName f)))
        renamer (if draft?
                  #(str "1111-11-11-" %)
                  #(str/replace-first % "--" "-"))]
    (-> f
        (fix-file-content! {:draft? draft?})
        (rename-with! renamer))))

(defn fix-file! [f]
  ;(println "> fix-file!" (.getPath f))
  (try
    (-> (case (ftype f)
          :page (fix-page! f)
          :post (fix-post! f))
        (rename-with! #(str/replace % #"\.md\.asc$" ".asc")))
    (catch Exception e
      (println "ERROR !!! for file" f ":" e))))

(->> (file-seq (io/file "."))
     (filter #(-> % .getName (str/ends-with? ".md.asc")))
     (run! fix-file!))

(println "DONE" (if dry-run? "[dry run, nothing changed]" ""))

(comment


 (fix-page! (io/file "./pages/2--about/nocv.md.asc"))
 (fix-file! (io/file "./pages/2--about/nocv.md.asc"))

 ; (re-matches #"^(\d+)--(.*)" (.getName f))
 (->> (file-seq (io/file "pages"))
      (filter #(re-matches #"(?:^|/)pages/(\d+)--(?:.*)" (.getPath %)))
      (map #(.getPath %)))

 (ftype (io/file "pages/4--clojure.md.asc"))
 (.getCanonicalPath (io/file "."))
 (fix-file!
  (io/file "pages/1--clojure.md.asc"))
 nil)
