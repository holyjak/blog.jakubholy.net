(ns cryogen.compile
  (:require [cryogen-core.compiler :refer [compile-assets-timed]]))

(defn compile-site []
  (compile-assets-timed
    {:update-article-fn
     (fn update-article [{:keys [slug] :as article}]
       (cond-> article
               slug (assoc :uri (str "/" slug "/"))))
     :extend-params-fn
     (fn extend-params [params site-data]
       (let [tag-count (->> (:posts-by-tag site-data)
                            (map (fn [[k v]] [k (count v)]))
                            (into {}))]
         (update
           params :tags
           #(map (fn [t] (assoc t
                           :count (tag-count (:name t))))
                 %))))}))

(comment
  {:update-article-fn
   (fn update-article [{:keys [slug] :as article}]
     (cond-> article
             slug (assoc :uri (str "/" slug "/"))))
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
  (set! *print-length* 5)
  (set! *print-level* 3)
  nil)
