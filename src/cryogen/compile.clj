(ns cryogen.compile
  (:require [cryogen-core.compiler :as compiler :refer [compile-assets-timed]]
            [net.cgrand.enlive-html :as enlive])
  (:import (java.io StringReader)))

;;------------------------------------------------------------ autolink-headings

(defn permalink-node [{{heading-id :id} :attrs :as heading} blog-prefix]
  (first
    (enlive/html
      [:a {:href (str "#" heading-id)
           :aria-label (str "Permalink to " (enlive/text heading))
           :class "anchor"}
       [:svg {:aria-hidden true :focusable false :width 16 :height 16}
        [:use {:xlink:href (str blog-prefix "/img/icons.svg#icon-link")}]]])))

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

(defn compile-site
  ([] (compile-site nil))
  ([changeset]
   (compile-assets-timed
     {:update-article-fn
                      (fn update-article [article config]
                        (if (clojure.string/starts-with? (:uri article) "/about/") ;; TODO Remove when done migrating
                          (do
                            (println ">>> removing" (:uri article))
                            nil)
                          (-> article
                              (slug->uri config)
                              (autolink-headings config))))

      :extend-params-fn
                      (fn extend-params [params site-data]
                        (let [tag-count (->> (:posts-by-tag site-data)
                                             (map (fn [[k v]] [k (count v)]))
                                             (into {}))]
                          (update
                            params :tags
                            #(map (fn [t] (assoc t
                                            :count (tag-count (:name t))))
                                  %))))}
     changeset)))

(comment

  (compile-site [(clojure.java.io/file "content/asc/posts/2020/spring-nevermore.asc")])
  (compile-site)

  (autolink-content-headings *cnt "")
  (permalink-node "")

  (require '[net.cgrand.enlive-html :as enlive])
  (def htm (slurp "public/leiningen-split-uberjar-into-dependencies-and-app/index.html"))

  (def *cnt (-> (last @*dbg)))


  (def)


  (set! *print-length* 15)
  (set! *print-length* nil)
  (set! *print-level* 3)
  (set! *print-level* nil)
  nil)
