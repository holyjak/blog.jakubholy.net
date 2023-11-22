#!/bin/sh
# Build script for Netlify

brew install openjdk # As of Nov 2023, Netlify still only has v8 :'(
clojure -M:build
npx -y pagefind --site public
