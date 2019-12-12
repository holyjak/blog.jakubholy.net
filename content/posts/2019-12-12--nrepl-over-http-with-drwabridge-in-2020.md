---
title: "nREPL over HTTP(s) with Drawbridge in 2020"
category: "SW development"
tags: [clojure, tool]
---

Sometimes the only way to get REPL into your production application is to tunnel it over HTTP. nREPL has a transport and Ring handler for that provided by [Drawbridge](https://github.com/nrepl/drawbridge). Heroku has a nice but too dated [guide on using nREPL with Drawbridge][herokudoc]. I would like to fill the missing bits here.

<!--more-->

## Server

Using

```clojure
[ring/ring-core "1.8.0"]
[ring/ring-jetty-adapter "1.8.0"]
[nrepl/nrepl "0.6.0"]
[nrepl/drawbridge "0.2.1"]
```

we start Jetty and hook nREPL into it via Drawbridge:

```clojure
(ns minbedrift-uav.webrepl
  "Start a nREPL server over HTTP"
  (:require
    [drawbridge.core]
    [ring.adapter.jetty :refer [run-jetty]]
    [ring.middleware.keyword-params]
    [ring.middleware.nested-params]
    [ring.middleware.params]
    [ring.middleware.session]))

(def drawbridge-handler
  (-> (drawbridge.core/ring-handler)
      (ring.middleware.keyword-params/wrap-keyword-params)
      (ring.middleware.nested-params/wrap-nested-params)
      (ring.middleware.params/wrap-params)
      (ring.middleware.session/wrap-session)))


      (defn -main []
        (run-jetty
          #(if (= "/repl" (:uri %))
             (drawbridge-handler %)
             {:status "OK" :body "Do something else..."})
         {:port 5555, :join? true}))
```

In practice you would run it in addition to your main API/.. and thus wanted `:join? false` so that the process doesn't block on starting the REPL server.

Refer to the original [Heroku Drawbridge guide][herokudoc] for details and regarding adding authentication

## Client

### Lein

The simples way I have found to connect is using Leiningen:

```clojure
;; project.clj
(defproject whatever "0.1.0-SNAPSHOT"
  :plugins [[nrepl/drawbridge "0.2.1"]]))
```

and `lein :connect http://localhost:5555/repl` (the `http://` is key).

### clj

It _should_ be possible to do this with `clj`:

```
clj -Sdeps '{:deps {nrepl/drawbridge {:mvn/version "0.2.1"}}}' \
  -m nrepl.cmdline --transport drawbridge.client/ring-client-transport \
  --connect --host localhost --port 5555
```

but it doesn't as of v.0.2.1, see [nrepl/drawbridge#40](https://github.com/nrepl/drawbridge/issues/40).

(If you get instead an exception in `bencode.clj` then you forgot to specify the drawbridge transport and use the default bencode one.)

[herokudoc]: https://devcenter.heroku.com/articles/debugging-clojure
