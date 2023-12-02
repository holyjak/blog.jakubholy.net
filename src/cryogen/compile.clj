(ns cryogen.compile
  "My wrapper around `compile-site` and various customization code"
  (:require
   [clojure.string :as str]
   [cryogen-core.compiler :as compiler :refer [compile-assets-timed]]
   [net.cgrand.enlive-html :as enlive])
  (:import (java.net URLEncoder)))

;;------------------------------------------------------------ autolink-headings

(defn permalink-node [{{heading-id :id} :attrs :as heading} blog-prefix]
  (let [id (or heading-id
             ;; Note: Some pre-cryogen headings lack heading-id, make one up:
             (-> (enlive/text heading)
                 (str/replace #"\s" "-")
                 (str/replace #"[?!*+='\"&#]" "")
                 (URLEncoder/encode "UTF-8")))]
    (first
      (enlive/html
        [:a {:id (when-not heading-id id) ; b/c there is not target with this ID
             :href (str "#" id)
             :aria-label (str "Permalink to " (enlive/text heading))
             :class "anchor"}
         [:svg {:aria-hidden true :focusable false :width 16 :height 16}
          [:use {:href (str blog-prefix "/img/icons.svg#icon-link")}]]]))))

(defn autolink-content-headings [content-nodes blog-prefix]
  (-> content-nodes
      (enlive/transform
        [#{:h1 :h2 :h3 :h4 :h5 :h6}]
        (fn autolink-heading [heading]
          (update heading
                  :content
                  #(apply vector (permalink-node heading blog-prefix) %))))
      #_(enlive/emit*)))

(defn autolink-headings
  "Make all headings into link targets to be accessible with `#heading-id`"
  [article {:keys [blog-prefix]}]
  (update article :content-dom autolink-content-headings blog-prefix))

;;---------------------------------------------------------- custom URI override

(defn slug->uri [{:keys [slug] :as article} _]
  (cond-> article
          slug (assoc :uri (str "/" slug "/"))))

;;--------------------------------------------------------------------- compile

(def extra-config
  {:update-article-fn
   (fn update-article [article config]
     (-> article
         (slug->uri config)
         (autolink-headings config)))

   :extend-params-fn
   (fn extend-params [params site-data]
     (let [tag-count (->> (:posts-by-tag site-data)
                          (map (fn [[k v]] [k (count v)]))
                          (into {}))]
       (update
         params :tags
         #(map (fn [t] (assoc t
                         :count (tag-count (:name t))))
               %))))})

(defn compile-site
  ([] (compile-site nil))
  ([changeset]
   (compile-assets-timed extra-config changeset)))

(comment

  (do
    ((requiring-resolve 'cryogen-core.plugins/load-plugins))
    (compile-site [(clojure.java.io/file "content/asc/posts/2023/4-heads-of-complexity.asc")]))
  ;(compile-site)

  (autolink-content-headings *cnt "")
  (permalink-node "")

  (require '[net.cgrand.enlive-html :as enlive])
  (def htm (slurp "public/leiningen-split-uberjar-into-dependencies-and-app/index.html"))

  (def *cnt (-> (last @*dbg)))


  (set! *print-length* 15)
  (set! *print-length* nil)
  (set! *print-level* 3)
  (set! *print-level* nil)

  (require 'cryogen-asciidoc.core :reload)
  ((requiring-resolve 'cryogen-core.plugins/load-plugins))
  (in-ns 'cryogen-asciidoc.core)
  (.convert @@cryogen-asciidoc.core/adoc
            #_"Src abbr:AOT[\"ahead pf time\"]"
            (slurp "content/asc/posts/2023/4-heads-of-complexity.asc")
            (-> (org.asciidoctor.Options/builder)
                ;(.safe org.asciidoctor.SafeMode/SAFE)
                (.attributes
                 (-> (org.asciidoctor.Attributes/builder)
                     (.attribute "icons" "font")
                     (.attribute "imagesdir" "/img")
                     (.attribute "relfileprefix" "../")
                     (.attribute "relfilesuffix" "/")
                     (.build)))
                (.build)))


  (def adoc (org.asciidoctor.Asciidoctor$Factory/create))
  (require 'cryogen-asciidoc.extensions)
  (cryogen-asciidoc.extensions/register-extensions
   adoc
   {"abbr" cryogen.asciidoctor/abbr})
  (.convert adoc
            "Adoc w/ xref:content/asc/posts/2021/simplicity.asc[link] here"
            {"attributes"
             {"relfileprefix" "PREFIX2"
              "relfilesuffix" "/"}})
  (.convert adoc ; Adoc 3.0
            "Adoc w/ xref:path-to/mydoc.adoc[link] here"
            (-> (org.asciidoctor.Options/builder)
              (.attributes
               (-> (org.asciidoctor.Attributes/builder)
                   (.attribute "relfileprefix" "../")
                   (.attribute "relfilesuffix" "/")
                   (.build)))
                (.build)))
  nil)

(comment

  (def adoc (org.asciidoctor.Asciidoctor$Factory/create))
  (require 'cryogen-asciidoc.extensions 'cryogen.asciidoctor)
  (cryogen-asciidoc.extensions/register-extensions
   adoc
   {"abbr" 'cryogen.asciidoctor/abbr})
  (.convert adoc ; Adoc 3.0
            "Src abbr:AOT[\"ahead pf time\"]"
            (-> (org.asciidoctor.Options/builder)
                (.build)))
  )
