(ns cryogen.server
  (:require [cryogen.compile :as my.compile]
            [compojure.core :refer [GET defroutes]]
            [compojure.route :as route]
            [ring.util.response :refer [redirect file-response]]
            [ring.util.codec :refer [url-decode]]
            [ring.server.standalone :as ring-server]
            [cryogen-core.watcher :refer [start-watcher! start-watcher-for-changes!]]
            [cryogen-core.plugins :refer [load-plugins]]
            [cryogen-core.compiler :refer [compile-assets-timed]]
            [cryogen-core.config :refer [resolve-config]]
            [cryogen-core.io :refer [path]]
            [clojure.string]))

(def extra-config
  {:update-article-fn
   (fn update-article [article config]
     (if (clojure.string/starts-with? (:uri article) "/about/") ;; TODO Remove when done migrating
       (do
         (println ">>> removing" (:uri article))
         nil)
       (-> article
           (my.compile/slug->uri config)
           (my.compile/autolink-headings config))))

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

(def extra-config-def
  (merge extra-config
         {:hide-future-posts? false}))

(defn init [fast?]
  (load-plugins)
  (compile-assets-timed extra-config-def)
  (let [ignored-files (-> (resolve-config) :ignored-files)]
    (run!
      #(if fast?
         (start-watcher-for-changes! % ignored-files compile-assets-timed extra-config-def)
         (start-watcher! % ignored-files compile-assets-timed extra-config-def))
      ["content" "themes"])))

(defn wrap-subdirectories
  [handler]
  (fn [request]
    (let [{:keys [clean-urls blog-prefix public-dest]} (resolve-config)
          req-uri (.substring (url-decode (:uri request)) 1)
          res-path (condp = clean-urls
                     :trailing-slash (path req-uri "index.html")
                     :no-trailing-slash (if (or (= req-uri "")
                                                (= req-uri "/")
                                                (= req-uri
                                                   (.substring blog-prefix 1)))
                                          (path req-uri "index.html")
                                          (path (str req-uri ".html")))
                     :dirty (path (str req-uri ".html")))]
      (or (file-response res-path {:root public-dest})
          (handler request)))))

(defroutes routes
  (GET "/" [] (redirect (let [config (resolve-config)]
                          (path (:blog-prefix config)
                                (when (= (:clean-urls config) :dirty)
                                  "index.html")))))
  (route/files "/")
  (route/not-found "Page not found"))

(def handler (wrap-subdirectories routes))

(defn serve
  "Entrypoint for running via tools-deps (clojure)"
  [{:keys [fast] :as opts}]
  (ring-server/serve
    handler
    (merge {:init (partial init fast)} opts)))

(comment
  (serve nil)
  nil)
