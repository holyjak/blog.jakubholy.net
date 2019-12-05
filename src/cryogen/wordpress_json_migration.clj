(ns cryogen.wordpress-json-migration
  (:require [clojure.data.json :as json]
            [clojure.string :as str])
  (:import (java.time.format DateTimeFormatter)
           (java.time LocalDateTime)))

(def ^:private ^:static UTC (java.time.ZoneId/of "UTC"))

(def ^:private ^:static post-date-format
  (.withZone
    ;; RFC3339 says to use -00:00 when the timezone is unknown (+00:00 implies a known GMT)
    (DateTimeFormatter/ofPattern "yyyy-MM-dd HH:mm:ss")
    UTC))

(def ^:private ^:static post-filename-date-format
  (.withZone
    ;; RFC3339 says to use -00:00 when the timezone is unknown (+00:00 implies a known GMT)
    (DateTimeFormatter/ofPattern "yyyy-MM-dd")
    UTC))

(def posts-path "wp-data/out/posts.json")

(defonce posts (json/read-str (slurp posts-path) :key-fn keyword))

(def tags-mapping
  {#{"jaxws" "REST" "webservice"}
   "api"
   #{"review"}
   "book"
   #{"BI" "bigdata" "nosql" "hadoop"}
   "data"
   #{"Docker" "ansible" "aws" "backup" "cloud" "continuous_deployment" "deployment" "linux" "logging" "ops" "puppet" "ssh" "vmware" "zabbix"}
   "DevOps"
   #{"worklog"}
   "experience"
   #{"classpath" "javaEE" "jetty" "jdbc" "jboss"}
   "java"
   #{"AspectJ" "AOP" "ckeditor" "DbUnitExpress" "EMF" "framework" "Javassist" "jsf" "jsr168" "jsr286" "project" "portlet" "seam" "spring"}
   "library"
   #{"agile" "best practices" "development" "lean" "leanstartup" "scrum" "xp"}
   "methodology"
   #{"profiling"}
   "performance"
   #{"CleanCode"}
   "quality"
   #{"privacy"}
   "security"
   #{"Testing" "junit" "SbE" "tdd"}
   "testing"
   #{"Maven" "eclipse" "Git" "ivy" "vagrant"}
   "tool"
   #{"error"}
   "troubleshooting"
   #{"frontend" "html5" "web" "webapp" "UI"}
   "webdev"
   #{"fp" "trends" "open_source" "patterns" "xml"}
   :remove})

(def map-tag
  (->> tags-mapping
       (mapcat (fn [[from-set to]]
                 (map #(vector % to)
                   from-set)))
       (into {})))

(defn map-tags [rare tags]
  (->> tags
       (remove rare)
       (map #(or (get map-tag %) %))
       (remove #{:remove})
       (into #{})
       vec))

(defn tag-mapper [posts]
  (let [tag-freq (->> posts
                      (mapcat :tags)
                      frequencies)

        ;; 224 out of 324 have freq <= 2
        {:keys [rare common]}
        (->> tag-freq
             (group-by (fn [[_ cnt]] (if (<= cnt 2) :rare :common)))
             (map (fn [[freq pairs]]
                      [freq (->> pairs
                                 (map key)
                                 set)]))
             (into {}))

        known (->> map-tag vals set)]
    (partial map-tags
             (clojure.set/difference rare known))))

(def gist-re #"(?:<div class=\"wp-block-embed__wrapper\">|\n|<br><br>)\s*(https:\/\/gist\.github\.com\/(?:\/|\w)*)")

(defn fetch-gist+css! [url]
  (-> (slurp (str url ".json"))
      (json/read-str :key-fn keyword)
      ((juxt :div :stylesheet))))

(defn inline-gists [content]
  (let [css-set (atom #{})]
    (:content (str/replace
                content
                gist-re
                (fn [[_ url]]
                  (let [[html css] (fetch-gist+css! url)]
                    (swap! css-set conj css)
                    html)))
      :extra-css @css-set)))

(defn save-post [map-tags {:keys [tags slug content title categories status published] :as post}]
  (try
    (when (= status "publish") ; status: draft, private, publish
      (let [date (LocalDateTime/parse published post-date-format)
            ;;year (.getYear date)
            ;;date-prefix (.format post-filename-date-format date)
            tags' (map-tags tags)
            file-path (str "content/asc/posts"
                           (str/replace-first slug #"/$" "")
                           ".asc")
            {:keys [content extra-css]} (inline-gists content)

            metadata (with-out-str
                       (clojure.pprint/pprint
                         {:title (str/replace title "''" "'")
                          :date (.format post-filename-date-format date)
                          :layout :post
                          :tags tags'
                          :tags-orig tags
                          :categories categories
                          :extra-css extra-css}))]

        (-> (clojure.java.io/file file-path)
            (.getParentFile)
            (.mkdirs))
        (spit file-path
              (str metadata
                   "\n++++\n"
                   content
                   "\n++++\n"))))
    (catch Exception e
      (throw (ex-info (str "Failed to convert the post '" title "' due to " (ex-message e)) post)))))

(defn migrate-posts [posts]
  (let [map-tags (tag-mapper posts)]
    (run! (partial save-post map-tags) posts)))

(comment

  (inline-gists (slurp "content/asc/posts//2018/11/26/java-understanding-the-different-network-https-exceptions.asc"))

  (time (migrate-posts posts))

  (set! *print-length* 10)
  (set! *print-length* nil)

  nil)





