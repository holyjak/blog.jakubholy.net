(ns cryogen.asciidoctor
  (:import (org.asciidoctor.extension BaseProcessor)
           (org.asciidoctor.ast ContentNode)))

(defn ^{:extension/types #{:inline :block}} abbr
  "abbr:AOP[\"Aspect-Oriented Programming\"] -> abbr with title."
  [^BaseProcessor this ^ContentNode parent ^String target attributes]
  ;; Returning a string is "deprecated" but still possible and since there is no
  ;; other way...
  ;; See https://discuss.asciidoctor.org/How-to-create-inline-macro-producing-HTML-In-AsciidoctorJ-td8313.html
  (str "<abbr title=\"" (get attributes "1" "N/A") "\">" target "</abbr>"))
