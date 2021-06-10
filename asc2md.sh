#!/bin/sh

FILE=$1
if [ -z "$FILE" ]; then echo "ERR: file arg required"; exit 1; fi
if [ ! -f "$FILE" ]; then echo "ERR: cannot read $FILE"; exit 1; fi
docker run -it -v $(pwd):/documents/ asciidoctor/docker-asciidoctor asciidoctor -b docbook --attribute leveloffset=+1 --out-file - $FILE | pandoc -t gfm -f docbook - > out.md
