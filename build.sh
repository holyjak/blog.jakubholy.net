#!/bin/sh
# Build script for Netlify
which sass || npm install -g sass
lein run
# clojure -M:build # TODO After https://clojure.org/releases/tools
