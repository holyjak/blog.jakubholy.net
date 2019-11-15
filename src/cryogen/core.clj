(ns cryogen.core
  (:require [cryogen-core.compiler :refer [compile-assets-timed]]
            [cryogen-core.plugins :refer [load-plugins]]))

(defn -main []
  (load-plugins)
  (compile-assets-timed)
  (System/exit 0))

(comment

  (do
    (require '[cryogen-core.compiler])
    (in-ns 'cryogen-core.compiler)
    (defn read-page-meta
      "Returns the clojure map from the top of a markdown page/post"
      [page rdr]
      (println "read-page-meta" page)
      (try
        (let [metadata (read rdr)]
          (s/validate schemas/MetaData metadata)
          metadata)
        (catch Exception e
          (throw (ex-info (ex-message e)
                          (assoc (ex-data e) :page page)))))))


  nil)
