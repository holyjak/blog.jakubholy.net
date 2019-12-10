(ns cryogen.core
  (:require [cryogen.compile]
            [cryogen-core.compiler :refer [compile-assets-timed]]
            [cryogen-core.plugins :refer [load-plugins]]))

(defn -main []
  (load-plugins)
  (cryogen.compile/compile-site)
  (System/exit 0))

(comment

  (-> @*a first (dissoc :content))
  (->> @*a
       (filter #(= "clojure-common-beginner-mistakes" (:slug %))))



  (slurp "content/asc/pages/search.asc")

  (require '[cryogen-core.compiler :as c])
  (let [config (cryogen-core.config/resolve-config)
        markup (first (cryogen-core.markup/markups))
        page (cryogen-core.compiler/parse-page (clojure.java.io/file "content/asc/pages/search.asc") config markup)]
    (selmer.parser/render-file (str "/html/" (:layout page)) (assoc page :page page)))



  ;; Override read-page-meta with troubleshooting
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

  ;; Convert manually
  (do
    (def adoc (org.asciidoctor.Asciidoctor$Factory/create))
    (with-open [rdr (clojure.java.io/reader "content/asc/posts/2019-03-21--translating-enterprise-spring-app-to-clojure.md")
                wrt (java.io.StringWriter.)]
      (.convert adoc
               (->> (java.io.BufferedReader. rdr)
                    (line-seq)
                    (clojure.string/join "\n"))
               {org.asciidoctor.Options/SAFE (.getLevel org.asciidoctor.SafeMode/SAFE)})))

  (do
    (require 'cryogen-asciidoc.core)
    (in-ns 'cryogen-asciidoc.core)
    (defn asciidoc
      "Returns an Asciidoc (http://asciidoc.org/) implementation of the
      Markup protocol."
      []
      (reify Markup
        (dir [this] "asc")
        (ext [this] ".asc")
        (render-fn [this]
          (fn [rdr config]
            (let [html (->>
                         (.convert adoc
                                       (->> (java.io.BufferedReader. rdr)
                                            (line-seq)
                                            (s/join "\n"))
                                       {Options/SAFE (.getLevel SafeMode/SAFE)})
                         (rewrite-hrefs (:blog-prefix config)))]
              (println "cryogen-asciidoc rendered" (subs html 0 200))
              html)))))

    (swap! markup-registry conj (asciidoc)))




  nil)
