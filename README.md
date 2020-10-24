# blog.jakubholy.net

## FIXME

1. _Loading failed for the <script> with source “https://www.googletagmanager.com/gtag/js?id=UA-98603541-2”_

## TODO

1. Mark posts with `best` tag, show them on the "Best" page
4. Optimize images for client screen size; use .webp if supported ... (the sharp plugin can do that, webp is off by default; only for local images though)
   - use https://web.dev/fast/use-lazysizes-to-lazyload-images (is there a Gatsby thing?) <> change img tags
   - see https://web.dev/fast/serve-responsive-images <> change img tags in old posts
5. Check for broken links
6. Link to holyjak.tumblr.com
7. On mobile, quotes have too much wasted space (padding?) on the sides - see e.g. /clojure-vs-java-few-datastructures-over-many-objects/

---

- ? for WP posts, fetch gists ahead of getsby build
- The <main>'s top is hidden behind the <header> on some pages such as 404 => add margin-top: 80px or something
- Old WP posts
  - Merge / remove some categories such as J2EE, DB2
  - FIXME handle `[gist https://gist.github.com/3683899 /]\` or gist at the end of the input if preceeded by a new line
- Old WP pages
  - replace indented with fenced code blocks, add lang
  - 👎 /pages/-heroes/: the image should be on right and the text flow next to it, ie 2 columns
- Look & feel:
   - re-enable support for cover images (commented out; need to pass remark its plugins in `gatsby-node`; perhaps move the code into a local plugin first)
   - desktop: show top pages, tag cloud, ...
- Highlight.js - include only + all langs used, incl. e.g. terraform
  - collapsible code blocks
- AsciDoc - add styling for NOTE etc.
---

# Usage

    # Auto-reloading:
    lein ring server
    clojure -X:serve

    # Build once:
    lein run
    clojure -M:build
