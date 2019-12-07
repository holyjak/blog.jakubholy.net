(ns cryogen.compile
  (:require [cryogen-core.compiler :refer [compile-assets-timed]]))

(defn compile-site []
  (compile-assets-timed
    {:update-article (fn [{:keys [slug] :as article}]
                       (when slug (println "Replacing URI with slug" (:uri article) "->" slug)) ;; FIXME rm
                       ;(swap! cryogen.core/*a conj article)
                       (cond-> article
                               slug (assoc :uri (str "/" slug "/"))))}))
