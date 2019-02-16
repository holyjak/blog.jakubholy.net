---
title: "How to use Clojure 1.10 pREPL to connect to a remote server (WIP)"
category: Languages
tags: ["clojure"]
---

Clojure 1.10 includes a new, program-friendly REPL or prepl (pronounced as "preppy," not p-repl). However there is still very little documentation about it, though it is reportedly in making (it is alpha, after all). Here I want to demonstrate how to start it and how to connect to it in a primitive way (I hope to improve the user experience of the client eventually).

<!--more-->

### Start the server

(Thanks to Oliver Caldwell' [Vim Conjure plugin docs](https://gist.github.com/Olical/8ddc726c41112be5eb450b12954d81f0) for this!)

To start the prepl server from the command line (I normally need only the first one):

```sh
clj -J-Dclojure.server.jvm="{:port 5555 :accept clojure.core.server/io-prepl}" \
    -J-Dclojure.server.node="{:port 5556 :accept cljs.server.node/prepl}" \
    -J-Dclojure.server.browser="{:port 5557 :accept cljs.server.browser/prepl}"
```

Or from Clojure REPL:

```clj
(require '[clojure.core.server :as server])
(server/start-server {:accept 'clojure.core.server/io-prepl
                        :address "127.0.0.1"
                        :port 5555
                        :name "my prepl"})
```

### Connect with the client

```clj
;; shell$ clj
user=> (require '[clojure.core.server :as server])
user=> (server/remote-prepl "127.0.0.1" 5555 *in* println)
(+ 1 2) ;; input
{:tag :ret, :val 3, :ns user, :ms 20, :form (+ 1 2)} ;; output

(println "hi" "there") ;; input
{:tag :out, :val hi there
} ;; output
{:tag :ret, :val nil, :ns user, :ms 4, :form (println "hi" "there")}  ;; output
```

We would likely want to show a nice user prompt and display nicely the output instead of println-ing the `EDN` returned from the server.

## More about prepl

Check out the [`clojure.core.server` api docs](https://clojure.github.io/clojure/clojure.core-api.html#clojure.core.server) and the prepl schema:

<!-- FIXME: This image is huge, get a smaller one somehow -->
<img alt="prepl schema" title="prepl schema" src="https://clojure.org/images/content/reference/prepl/prepl.png" width="100%" />
