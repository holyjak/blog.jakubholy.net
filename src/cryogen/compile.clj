(ns cryogen.compile
  (:require [cryogen-core.compiler :refer [compile-assets-timed]]))

(defn compile-site []
  (compile-assets-timed
    {:update-article (fn [{:keys [slug] :as article}]
                       (cond-> article
                               slug (assoc :uri (str "/" slug "/"))))}))
