#!/bin/sh
# Build script for Netlify

## Get newer Java
## (1) Brew
# Broken - somehow, the java binary is there but we can't execute it (bad user??)
#brew install openjdk@21 # As of Nov 2024, Netlify still only has v8 :'(
#export PATH="/home/linuxbrew/.linuxbrew/opt/openjdk@21/libexec/bin:$PATH"
#echo "DBG: java version $(/home/linuxbrew/.linuxbrew/opt/openjdk@21/libexec/bin/java --version)"

## (2) DIY; source: https://answers.netlify.com/t/java-11-support/67078/19
CACHE_DIR=$NETLIFY_BUILD_BASE/cache
JAVA_DOWNLOAD_URL="https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz"
JAVA_RELEASE=jdk-17.0.2 # Must match directory inside archive in JAVA_DOWNLOAD_URL
currentver="$(java -version 2>&1 |head -n1 | cut -d'"' -f2 |cut -d'.' -f1)"
requiredver="11" # Shadow-cljs requires a minimum of Java 11
# Version check shamelessly copied from StackOverflow:
# https://unix.stackexchange.com/a/285928
if [ ! "$(printf '%s\n' "$requiredver" "$currentver" | sort -V | head -n1)" = "$requiredver" ]; then
  echo "Java version 11 is required as minimum by Shadow-cljs (found Java version $currentver)"
  if [ ! -d "$CACHE_DIR/$JAVA_RELEASE" ]; then
    echo "Downloading $JAVA_RELEASE since it isn't available in cache"
    wget --quiet -O openjdk.tar.gz $JAVA_DOWNLOAD_URL
    tar xf openjdk.tar.gz --directory $CACHE_DIR
  fi
  echo "Enabling $JAVA_RELEASE from cache, by making it available on PATH"
  export PATH=$CACHE_DIR/$JAVA_RELEASE/bin:$PATH
fi

# Build the site
clojure -M:build
npx -y pagefind --site public
