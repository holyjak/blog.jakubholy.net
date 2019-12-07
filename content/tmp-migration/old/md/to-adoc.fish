#!/usr/bin/env fish
# See https://pandoc.org/MANUAL.html
set DIR ( bash -c "cd .; pwd -P" )
echo ">>> Cleanup..."
find $DIR -type f -name "*.asc" -delete
echo ">>> Converting..."
# NOTE: As of pandoc 2.7.3, the YAML md block ext is not supported for gmf, only for markdown
find . -type f -name "*.md" -exec pandoc --lua-filter=$DIR/pandoc-passthrough.lua --template=$DIR/pandoc.tpl.adoc --verbose -s  --wrap=none -f markdown+emoji+yaml_metadata_block -t asciidoctor -o \{\}.asc \{\} \;
echo ">>> Fixing..."
$DIR/fix-files.clj
echo ">>> DONE"
