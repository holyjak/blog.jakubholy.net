#!/bin/sh
# Build script for Netlify
lein run
# clojure -M:build # TODO After https://clojure.org/releases/tools
# npx -y pagefind --site public
wget -O pagefind.tgz https://github.com/CloudCannon/pagefind/releases/download/v1.0.3/pagefind-v1.0.3-aarch64-unknown-linux-musl.tar.gz
tar zxvf pagefind.tgz
chmod u+x ./pagefind
./pagefind --site public
