---
title: "Leiningen: Split an uberjar into dependencies.jar and app.jar (to optimize Docker layers and AWS Lambda functions)"
category: "[Dev]Ops"
tags: [DevOps, clojure, Docker]
---

I want to split my application uberjar into a separate JAR with only the dependencies and a JAR with only the application code so that I can upload them as separate "layers" and thus leverage layer caching. While my code changes frequently and is tiny, the dependencies change rarely and are much bigger. If I can add them as a separate [Docker layer](https://dzone.com/articles/docker-layers-explained) or [AWS Lambda layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) then this can be cached on the server and reused when I upload a new version - saving time, bandwidth, and money.

<!--more-->

I was able to figure how how to do that with Leiningen thanks to the invaluable help of `mikerod` at the [#leiningen](http://clojurians.slack.com/messages/leiningen) channel:

#### `project.clj`

```clojure
(defproject myapp "0.1.0-SNAPSHOT"
  :dependencies [...]
  :target-path "target/%s/"                                     ;; (1)
  :auto-clean false                                             ;; (2)
  :profiles {:jar     {:jar-name "myapp.jar"                    ;; (3)
                       :main minbedrift-uav.core ; actually not needed
                       :aot [minbedrift-uav.core]}
             :uberjar {:uberjar-name "myapp-dependencies.jar"   ;; (4)
                       :uberjar-exclusions [#"README.md" "project.clj"]
                       :source-paths ^:replace []
                       :resource-paths ^:replace []}}
  :aliases {"jar" ["with-profile" "jar" "jar"]})                ;; (5)
```

Highlights

   1. Store jar and uberjar build artefacts separately so that they do not mess up with each other
   2. Disable `:auto-clean` so that building the uberjar won't delete the jar
   3. Move the `:main` and `:aot` from the top level into the new `:jar` profile so that they are not run during uberjar-ing
      (it seems that `:main` cannot be overriden to `nil` in `:uberjar`; and with `nil` we cannot apply `^:replace`)
   4. Configure the uberjar to have empty (re)source paths and thus not include the application code; here `^:replace` is crucial
   5. Add a convenience alias so that `lein jar` will automatically activate the `jar` profile

#### `Dockerfile`

```Dockerfile
FROM azul/zulu-openjdk-alpine:11-jre

WORKDIR /app
COPY /target/uberjar/myapp-dependencies.jar /app/
COPY /target/jar/myapp.jar /app/

CMD java -Dfile.encoding=UTF-8 -cp myapp-dependencies.jar:myapp.jar myapp.core
```

The crucial thing here is to include the dependencies _before_ the application code.

#### Building

```bash
lein do clean, jar, uberjar
docker build -t myapp .
```

(Notice that we have to `clean` manually now.)

### Alternatives

Alternatively we could use e.g. the [`lein-libdir`](https://github.com/djpowell/lein-libdir) plugin to copy all dependencies into a directory and include their jars individually (e.g. `COPY /lib/*.jar /app/`)
