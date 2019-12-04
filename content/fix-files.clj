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
  (if (or
       (str/includes? (.getParent f) "/pages/")
       (str/ends-with? (.getParent f) "/pages"))
    :page
    :post))

(def f (io/file "content/asc/pages/1--best.asc")) ; FIXME rm

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
          page-index (assoc :page-index page-index
                            :navbar?    true)))

(defn fill-metadata [f opts lines]
  (let [[md content-lines] (metadata+content-lines f lines)
        md-str (prn-str (update-metadata md opts))]
    (cons md-str content-lines)))

(defn fix-file-content!
  ([f] (fix-file-content! f false))
  ([f draft?]
   (assert (and f (.getPath f)) "Not a file?!")
   (let [opts {:draft? draft?
               :layout (ftype f)
               :page-index nil}
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
                    #(do (or (.renameTo f f')
                             (throw (Exception. "renameTo failed")))
                         f'))]
    (if (= n n')
      f
      (do
        (println "Rename" (.getPath f) "->" n')
        (rename!)))))

(defn fix-page! [f]
  (let [[_ page-index slug] (re-matches #"^(\d+)--(.*)" (.getName f))
        renamer (if page-index
                  (fn [_] slug)
                  identity)]
    (-> f
        (fix-file-content!)
        (rename-with! renamer))))

(defn fix-post! [f]
  (let [draft? (not (re-find #"^\d{4}-\d{2}-\d{2}--?" (.getName f)))
        renamer (if draft?
                  #(str "1111-11-11-" %)
                  #(str/replace-first % "--" "-"))]
    (-> f
        (fix-file-content! draft?)
        (rename-with! renamer))))

(defn fix-file! [f]
  ;(println "> fix-file!" (.getPath f))
  (case (ftype f)
    :page (fix-page! f)
    :post (fix-post! f)))

(->> (file-seq (io/file "."))
     (filter #(-> % .getName (str/ends-with? ".asc")))
     (run! fix-file!))

(comment
 (.getCanonicalPath (io/file "."))
 (fix-file!
  (io/file "tst/2018-12-21--aws-rds-find-out-login-credentials.asc"))
 nil)
