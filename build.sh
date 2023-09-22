#!/bin/sh
# Build script for Netlify
clojure -M:build
npx -y pagefind --site public
