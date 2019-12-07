TODO Gatsby -> Cryogen
======================

✅ 3. Fix raw blocks skipped: aside, `<!--more-->`
✅ 2. Add /contacts/, /search/ pages
✅ 5. Fix ToC
✅ 6. Remember to re-add `:navbar? true :page-index 1` to menu pages (or make fix-files do it) ; 
✅ 8. GA
✅ 10. Rm old gatsby files
✅ 2. Import old pages - see current cleanup code, gist embedding
✅ 7. SEO - description for previews. Add `prefix: "og: http://ogp.me/ns#"`, see Seo.js


0. Fixes
   * "How to use Clojure 1.10 pREPL to connect to a remote server (WIP)" twice
   * "http://localhost:3000/2019-09-27-fixing-json-oom-with-streaming-and-mapdb/" should use double \`\` in-word: `Device\`s`
   * Highlight.js - button to show / copy raw text?
1. Extend Cryogen to drop date from file names / custom `slug`? so that new posts keep the same, date-less URLs.
1. Drop index from `2--about/`, see FIXME in the code
2. Check everything
3. Highligh.js for: bash, clojure, groovy, java, markdown - see https://highlightjs.org/download/
9. Styling, Menu
   * 👇show tags next to date
   * 👇date in yyyy-mm-dd inst.of words
   * ✅ move svg icons to the separate file
1. Rename page About -> Me
1. Disqus integration
1. Better Tags page - show cloud and articles - re-add "word cloud" with counts; include categories, when supported
----
* Support for categories ?
* Block "Recommended links feed" -> Tumblr (remember icon; add to menu?)
* Add twitter:card from Seo.js
* ✅ Check perf with web.dev (Perf 85%, Access. 65%, SEO 89%, was: all 98-100%)
  * Future perf improvements:
    * Async load of lotus-highlightjs.min.css - 210 ms, 0.73 KB 
    * Somehow optimize load of blog.css - 150 ms, 3.38 KB, normalize.css - 260 ms, 2.62 KB
* Aside with tumblr feed - `curl -H "Accept: application/json" 'https://holyjak.tumblr.com/api/read/json'` => latest N type icon + title + description (substr)
* SEO Improvemements - see old Seo.js (twitter card, ...)
* Fix the post with `<aside>`

Notes
-----

Setup for Lotus / themes using SASS:

```
gem update --system
gem install compass
# gem install sass
brew install sass/sass/sass # Ruby SASS is deprecated, use this Dart SASS
```

But:

```
compiling sass
	 themes/lotus/css --> themes/lotus/css
 Could not find an option named "compass".

Usage: sass <input.scss> [output.css]
       sass <input.scss>:<output.css> <input/>:<output/> <dir/>
```

As of 2016: "Compass is already end-of-life and un-maintained. If a new maintainer wants to port it, they would be welcome to."
