;; TODO list:
;; . Does release mode work?
;; . Find all code on page, enliven it
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
                                   defaultHighlightStyle]]
   ["@codemirror/state" :refer [EditorState]]
   ["@codemirror/view" :as view :refer [EditorView lineNumbers showPanel]]

   [nextjournal.clojure-mode :as cm-clj]))

(enable-console-print!)
(sci/alter-var-root sci/print-fn (constantly *print-fn*))
(sci/alter-var-root sci/print-err-fn (constantly *print-err-fn*))

(defonce sci-ctx (doto (sci/init {})
                   (sci/merge-opts fulcro-config/config)))

(defn eval-code [code]
  (try (sci/eval-string* sci-ctx code)
       (catch :default e
         {::error (str (.-message e))})))

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
                 (println "Code editor: output-panel" new)
                 (if (::error new)
                   (do
                     (.add (.-classList dom) "error")
                     (set! (.-textContent dom) (str "ERROR: " (::error new))))
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

(defonce extensions #js[theme
                        (history)
                        (syntaxHighlighting defaultHighlightStyle)
                        (view/drawSelection)
                        ;(foldGutter)
                        (lineNumbers)
                        (.. EditorState -allowMultipleSelections (of true))
                        cm-clj/default-extensions
                        (.of view/keymap cm-clj/complete-keymap)
                        (.of view/keymap historyKeymap)])

(defn bind-editor! [el]
  {:pre [el]}
  ;; TODO Add element for output dom
  (let [last-result (atom nil)
        exts (.concat extensions
                      #js [(sci-extension (partial reset! last-result))
                           (output-panel-extension last-result)])]
    (new EditorView
         #js {:parent el
              :state (.create EditorState #js {:doc "
(ns test1
  (:require
    [com.fulcrologic.fulcro.algorithms.denormalize :as fdn]
    [com.fulcrologic.fulcro.application :as app]
    [com.fulcrologic.fulcro.components :as comp :refer [defsc]]
    [com.fulcrologic.fulcro.dom :as dom]))
(defsc Root [this props] (dom/h3 \"Hello from Fulcro!\"))
(app/mount! (app/fulcro-app) Root \"result\")
                                                    "
                                               :extensions exts})})))

(defn render
  "Called on load. Find all target text areas and bind to them."
  []
  (println "Code editor: render")
  (def X
    (bind-editor! (js/document.getElementById "code"))))

(comment
  (js/console.log "Code editor: " X)
  (def X
    (bind-editor! (js/document.getElementById "result")))

  )
