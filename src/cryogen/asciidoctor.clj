(ns cryogen.asciidoctor
  (:import (org.asciidoctor.extension BaseProcessor)
           (org.asciidoctor.ast ContentNode)
           (java.util HashMap)))

(defn ^{:extension/types #{:inline :block}} abbr
  "abbr:AOP[\"Aspect-Oriented Programming\"] -> abbr with title."
  [^BaseProcessor this ^ContentNode parent ^String target attributes]
  (let [attrs (HashMap. {})
        opts (HashMap. {"subs" []})]
    (.createPhraseNode
      this parent "quoted"
      (str "<abbr title=\"" (get attributes "1" "N/A") "\">" target "</abbr>")
      attrs opts)))

