;; TODO list:
;; . Dark theme
(ns holyjak.code-editor
  "Add interactive code editors with cljs evaluation to a blog post.
   Powered by CodeMirror and SCI."
  (:require
   [sci.core :as sci]
   [sci.configs.fulcro.fulcro :as fulcro-config]

   ;; Inspiration: https://github.com/nextjournal/clojure-mode/blob/main/demo/src/nextjournal/clojure_mode/demo.cljs
   ["@codemirror/commands" :refer [history historyKeymap]]
   ["@codemirror/language" :refer [#_foldGutter
                                   syntaxHighlighting
                                   ;defaultHighlightStyle
                                   HighlightStyle]]
   ["@codemirror/state" :refer [EditorState]]
   ["@codemirror/view" :as view :refer [EditorView lineNumbers showPanel]]
   ["@lezer/highlight" :refer [tags]]

   ;; For re-export to sci
   ["react" :as react]
   ["react-dom" :as react-dom]

   [nextjournal.clojure-mode :as cm-clj]))

(enable-console-print!)
(sci/alter-var-root sci/print-fn (constantly *print-fn*))
(sci/alter-var-root sci/print-err-fn (constantly *print-err-fn*))

(defonce sci-ctx (doto (sci/init {:classes {'js js/globalThis :allow :all}
                                  :js-libs {"react" react
                                            "react-dom" react-dom}})
                   (sci/merge-opts fulcro-config/config)))

(defn eval-code [code]
  (try (sci/eval-string* sci-ctx code)
       (catch :default e
         (cond-> {::error (str (.-message e))}
           (:line (ex-data e))
           (assoc ::location (select-keys (ex-data e) [:line :column]))))))

(defn eval-all [on-result  x]
  (on-result (some->> (.-doc (.-state x)) str eval-code))
  true)

(defn sci-extension [on-result]
  (.of view/keymap
       #js [#js {:key "Mod-Enter" ; Cmd or Ctrl
                 :run (partial eval-all on-result)}]))

(defn mac? []
  (some? (re-find #"(Mac)|(iPhone)|(iPad)|(iPod)" js/navigator.platform)))

(defn output-panel-extension
  "Display a panel below the editor with the output of the
   last evaluation (read from the passed-in `result-atom`)"
  [result-atom]
  (let [dom (js/document.createElement "div")]
    (add-watch result-atom :output-panel
               (fn [_ _ _ new]
                 (if (::error new)
                   (do
                     (.add (.-classList dom) "error")
                     (set! (.-textContent dom) (str "ERROR: " (::error new)
                                                    (some->> new ::location pr-str (str " at ")))))
                   (do
                     (.remove (.-classList dom) "error")
                     (set! (.-textContent dom) (str ";; => " (pr-str new)))))))
    (set! (.-className dom) "cm-output-panel")
    (set! (.-textContent dom)
          (str "Press "
               (if (mac?) "Cmd" "Ctrl")
               "-Enter in the editor to evaluate it. Return value will show up here."))
    (.of showPanel
         (fn [_view] #js {:dom dom}))))

(def theme
  (.theme
   EditorView
   #js {".cm-output-panel.error" #js {:color "red"}}))

;; Define custom classes so that we can control colors => support both light and dark mode
;; Source: https://discuss.codemirror.net/t/dynamic-light-mode-dark-mode-how/4709/5
(def highlight-style
  (.define HighlightStyle
           #js [#js {:tag (.-atom tags) :class "cmt-atom"}
                #js {:tag (.-comment tags) :class "cmt-comment"}
                #js {:tag (.-keyword tags) :class "cmt-keyword"}
                #js {:tag (.-literal tags) :class "cmt-literal"}
                #js {:tag (.-number tags) :class "cmt-number"}
                #js {:tag (.-operator tags) :class "cmt-operator"}
                #js {:tag (.-separator tags) :class "cmt-separator"}
                #js {:tag (.-string tags) :class "cmt-string"}]))

(defonce extensions
  #js[theme
      (history)
      (syntaxHighlighting highlight-style #_defaultHighlightStyle)
      (view/drawSelection)
                        ;(foldGutter)
      (lineNumbers)
      (.. EditorState -allowMultipleSelections (of true))
      cm-clj/default-extensions
      (.of view/keymap cm-clj/complete-keymap)
      (.of view/keymap historyKeymap)])

(defn bind-editor! [el code]
  {:pre [el code]}
  (when (seq code)
    (println "Initial code eval =>" (eval-code code)))
  (let [target-el (js/document.createElement "div")
        last-result (atom nil)
        exts (.concat extensions
                      #js [(sci-extension (partial reset! last-result))
                           (output-panel-extension last-result)])]
    (.replaceWith el target-el)
    (new EditorView
         #js {:parent target-el
              :state (.create EditorState #js {:doc code
                                               :extensions exts})})))

(defn ^:export render
  "Called on load. Find all target code snippets and bind to them."
  []
  (println "Code editor: render")
  ;; Asciidoc: process `[source,text,role="code-editor"]` blocks ('text' required
  ;; to disable highlight.js messing with the content)
  (doseq [code-el (seq (js/document.querySelectorAll ".code-editor .content code.language-text"))
          :let [code (some-> code-el .-textContent)]
          :when code]
    (bind-editor! code-el code)))

