TODO Gatsby -> Cryogen
======================

1. Styling, Menu
   * 👇show tags next to date
   * 👇date in yyyy-mm-dd inst.of words
   * move svg icons to the separate file
2. Add /contacts/, /search/ pages
2. Import old pages - see current cleanup code, gist embedding
3. Fix raw blocks skipped: aside, `<!--more-->`
4. Check everything
5. Fix ToC
6. Remember to re-add `:navbar? true :page-index 1` to menu pages (or make fix-files do it) ; About -> Me

* Support for categories
* GA
* Recommended links feed -> Tumblr (remember icon; add to menu?)

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
