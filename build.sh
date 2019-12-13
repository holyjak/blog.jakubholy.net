#!/bin/sh
# Build script for Netlify
which sass || npm install -g sass
lein run
