#!/bin/sh
echo "Copy WP posts"
cd old/wp/posts
rsync -vrR . ../../../../asc/posts || exit 1
cd -
echo "Copy (migrated) Gatsby/.md posts"
cd old/md
rsync -vrR --include '*.asc' --exclude '*.*' . ../../../asc || exit 1
cd -
echo "Copy new extra pages"
cd new/pages
rsync -vrR . ../../../asc/pages || exit 1
cd -
echo "DONE"
