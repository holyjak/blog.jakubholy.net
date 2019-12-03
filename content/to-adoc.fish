#!/usr/bin/env fish
# See https://pandoc.org/MANUAL.html
echo ">>> Converting..."
# NOTE: As of pandoc 2.7.3, the YAML md block ext is not supported for gmf, only for markdown
find . -type f -name "*.md" -exec pandoc --lua-filter=/Users/holyjak/Projects/blogs/blog-jh-cryogen/content/pandoc-passthrough.lua --template=/Users/holyjak/Projects/blogs/blog-jh-cryogen/content/pandoc.tpl.adoc --verbose -s  --wrap=none --toc -f markdown+emoji+yaml_metadata_block -t asciidoctor -o \{\}.asc \{\} \;
echo ">>> Renaming..."
find . -type f -name "*.asc" -exec rename -f -X -x \{\} \;
echo ">>> DONE"
