(defproject cryogen "0.1.0"
            :description "Simple static site generator"
            :url "https://github.com/lacarmen/cryogen"
            :license {:name "Eclipse Public License"
                      :url "http://www.eclipse.org/legal/epl-v10.html"}
            :dependencies [[org.clojure/clojure "1.10.1"]
                           [ring/ring-devel "1.13.0"]
                           [compojure "1.6.2"]
                           [ring-server "0.5.0"]
                           [cryogen-asciidoc "0.3.3"]
                           [cryogen-core "0.4.0"]
                           [cryogen-asciidoc "0.3.3"]
                           ;; TMP data.xml to parse old blog posts:
                           #_[org.clojure/data.json "0.2.7"]]
            ;:repositories [["local" "file:///Users/holyjak/.m2"]]
            :plugins [[lein-ring "0.12.5"]]
            :main cryogen.core
            :ring {:init cryogen.server/init
                   :handler cryogen.server/handler}
            :aliases {"serve"      ["run" "-m" "cryogen.server"]
                      "serve-fast" ["run" "-m" "cryogen.server" "fast"]})
