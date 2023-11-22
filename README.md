# blog.jakubholy.net

## FIXME

1. _Loading failed for the `<script>` with source “https://www.googletagmanager.com/gtag/js?id=UA-98603541-2”_

# Usage

## Building and serving

Prereq.:

    yarn install # Netlify does this automatically

Regular usage:

    # Auto-reloading:
    bb serve-fast
    #lein ring server
    #clojure -X:serve # or clojure -X:serve-fast

    # Build once:
    bb build
    #lein run
    #clojure -M:build

Testing search (after `bb build`):

    npx -y pagefind --site public --serve

### Develop SCSS

Run `bb build` + run a static http file serving server from ./public/ + run `sass -w --stop-on-error --charset themes/lotus/css/blog.scss:public/css/blog.css`. And perhaps also `sass -w --stop-on-error --charset themes/lotus/css/lotus-highlightjs.min.scss:public/css/lotus-highlightjs.min.css`.

## Authoring

### Preamble {...}

[Common preamble keys](http://cryogenweb.org/docs/writing-posts.html): `:category :date :draft? :layout  :tags :title :toc`

Special preamble keys (those marked ❌ are carry-over from old platforms and currently do nothing):

 * `:related` - WIP - mark a set of related posts with the same keyword so that you can automatically add links connecting them at the bottom of each post
 * ❌ `:extra-css`
 * ❌ `:categories`
 * ❌ `:slug`
 * `:extra-css ["/pagefind/pagefind-ui.css"]` - see ./themes/lotus/html/base.html
 * `:extra-js [{:src "/pagefind/pagefind-ui.js" :async? true}]}` - see ./themes/lotus/html/base.
 * `:asciidoctor {:attributes {"k1" "v1", ...}}`

### Images

Put them inside `~/content/img/<post name>/` and refer to them from the post via `image::/img/<post name>/<img file>[label]`.

You can add `role="left-floating-img"` (or `right-...`) to set css class of the same name.

### Custom macros

See `content/config.edn` - e.g. `abbr`

### Inter-document links

Use `xref:relative/path/to/target.adoc[some label]`; adoc attributes relfile* in `config.edn` adjust for the fact that we turn `target.adoc -> target/index.html`.
(FIXME: Rename all .asc to .adoc for easier life.)

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

