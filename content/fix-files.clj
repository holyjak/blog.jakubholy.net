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

(defn fix-file-content!
  ([f] (fix-file-content! f false))
  ([f draft?]
   {:pre [(and f (.getPath f))]}
   (let [transf (comp
                 (if draft?
                   (once #(str/replace-first % ":draft? false" ":draft? true")
                         #(println " in" (.getName f) ":draft? -> true"))
                   identity)
                 (once (partial escape-title f))
                 (once #(str/replace-first % ":layout :TODO" (str ":layout " (ftype f)))))
         f' (io/file (.getParentFile f) (str (.getName f) ".tmp"))]
     (with-open [rdr (io/reader f)
                 wrt (io/writer (.getPath f'))]
       (run!
        #(.write wrt (str (transf %) "\n"))
        (line-seq rdr)))
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
  (fix-file-content! f))

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
