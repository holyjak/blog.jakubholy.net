---
title: "Clojure"
---
Clojure-related resources and notes.


# Why Clojure(Script)?




> Clojure(Script) is simpler yet more expressive (than Java(Script))
> *- paraphrase of David Nolan in [ClojureScript Next](https://swannodette.github.io/2015/07/29/clojurescript-17/)*



Clojure (and thus ClojureScript) is one of the **best designed** programming languages, it is really well thought-through and great care is taken to ensure that the pieces do each a different thing yet fit perfectly together. It has been designed after years of painful experiences with production systems in Java, C++, Common Lisp and others to avoid the main sources of complexity and maintenance headaches. (For details see the [Clojure Rationale](https://clojure.org/about/rationale) and talks by Rich Hickey such as [Effective Programs - 10 Years of Clojure](https://www.youtube.com/watch?v=2V1FtfBDsLU).)

Clojure enables **interactive programming** - you can connect a REPL to your application and develop it and interact with it from code while it is running. You cannot imagine the power and the insanely short feedback loop until you experience it. See the short screencast [Interactive programming Flappy Bird in ClojureScript](https://www.youtube.com/watch?v=KZjFVdU8VLI) for an idea.

It has performant **immutable data structures** that make many concurrency-related defects impossible.

It has a powerful **library of data transformation** functions that can be effectively combined together.

When necessary, you can use **macros** to remove duplication and fit the language to your problem.

No matter whether you use Clojure core or a library, they use raw Clojure data - that you can access and transform through the core functions you know and love. No more learning a custom API for every library\! (Though you still need to learn and understand its data.)

It has also **[core.async](https://clojure.com/blog/2013/06/28/clojure-core-async-channels.html)** for asynchronous/reactive programming,  **[clojure.spec](https://clojure.org/about/spec)** to document, verify, use and test your data, and much more.

Clojure has also an active and friendly community. You always get help in the official Slack organization, one of the mailing lists, and other places.


##### Nate Wildermuth: ClojureScript and the Blub Paradox



(highlights and \[insertions\] mine)


> That makes the important advantages of ClojureScript hard to perceive, as **the essential difference \[from JS\] belongs in new patterns of problem solving rather than new syntax and grammar**.
>
> ClojureScript does the opposite. Instead of seeking to avoid the danger of using one bug-prone function, it provides three types of switch statements, each suited to different kinds of control flow. These options not only allow one to engage in high-level forms of abstraction, but actually encourage this kind of thinking. Moreover, the entire pattern of thought begins at a much higher level, seeking to recognize patterns even before fully understanding the solution. \[The same applies for Clojure and Concurrency, having cca 4 ways to manage state instead of Java’s one -makes you think about what/why/how, which is a Good Thing (TM)\]
>
> ClojureScript, like JavaScript, doesn't come with pattern matching. This would be a problem, except that ClojureScript comes with something better: macros.
>
> Some languages run close to the "metal" — \[…\]. Other languages take the opposite approach, running close to the "human metal" — our minds. The closer that a language can express (or in the case of macros, be modified to express) human thoughts, the closer we get to a program that we can understand natively. We no longer need to change our thoughts to fit the language. Instead, we change our language to fit the thoughts.




# For beginners




### Note: Clojure and productivity



You can be very productive with Clojure, much more than e.g. in Java thanks to its interactive development, simplicity, and powerful tools such as macros. However there are some preconditions, as Eric Normand writes in [PurelyFunctional.tv Newsletter 266](https://purelyfunctional.tv/issues/purelyfunctional-tv-newsletter-266-beginner-experience/):


> When you don't have the stuff above (paren\[these\] management, integrated REPL, hot code reloading, and experience debugging the errors), the \[development\] cycle can be much slower than the descendants of punchcard languages.



(Fortunately the community is working on providing better beginner user experience, better tools, and better error reporting to alleviate these.)

So to really experience the productivity and pleasure of Clojure(Script), you need:


1.  A tool to enable effective, productive (structural) editing of Clojure code, such as [Parinfer](https://shaunlebron.github.io/parinfer/)
2.  A good editor with an integrated REPL so that you can evaluate your code and interact with your running application in a frictionless way. Cursive (paid for commercial use) and Emacs (powerful but very steep and long learning curve) are the most popular, but there are also special ones for beginners such as [Nightcode](https://sekao.net/nightcode/) and (simpler, web-based) [Lightmod](https://sekao.net/lightmod/). (Many editors have some Clojure support but the quality and depth and thus user experience vary a lot.)
3.  ClojureScript: hot code reloading (which [Figwheel](https://github.com/bhauman/lein-figwheel) does perfectly)
4.  Experience debugging errors - sadly you have to learn that though tools such as Ultra/Pretty (see below) and [Expound](https://github.com/bhb/expound) for Spec do help.
5.  Not to hesitate to ask for help and advice at the Clojurians Slack community :-)




### Resources for beginners



Official sources


  - [Clojure.org](https://clojure.org/) and its [References](https://clojure.org/reference/reader) and [Guides](https://clojure.org/guides/getting_started).
  - [ClojureScript.org](https://clojurescript.org/) and its [References](https://clojurescript.org/reference/documentation) and [Guides](https://clojurescript.org/guides/quick-start).



Help & learning


  - [Clojure Cheatsheet](https://jafingerhut.github.io/cheatsheet/grimoire/cheatsheet-tiptip-cdocs-summary.html) and [ClojureScript Cheatsheet](https://cljs.info/cheatsheet/)
  - [ClojureDocs](https://clojuredocs.org/) - function documentation with examples
  - [Grimoire](https://www.conj.io/) - another, newer function documentation site with examples
  - [4clojure](https://www.4clojure.com/) - learn Clojure by solving small task and comparing your solution with others
  - [Maria: learn Clojure with Shapes](https://www.maria.cloud/intro) - a cool, beginner-friendly ClojureScript notebook-style editor with a built-in introduction to Clojure(Script) using graphical programming
  - On-line books
      - [Clojure for the Brave and True](https://www.braveclojure.com/)



Community, advice, fora


  - [Clojurians](https://clojurians.net/) - the official Slack organization with channels for Clojure, ClojureScript, and most popular libraries and topics. Leading developers and authors often answer questions.
  - [Clojure](https://groups.google.com/forum/#!forum/clojure) and [ClojureScript Google Groups](https://groups.google.com/forum/#!forum/clojurescript) - for advice, announcements, keeping informed
  - [Clojureverse](https://clojureverse.org/) - friendly discussion fora
  - Newsletters to keep updated about the latest development, useful libraries, etc.
      - [The REPL](https://therepl.net/) by Daniel Compton([older issues](https://us7.campaign-archive.com/home/?u=fef380870c4a5633a21f55d8e&id=b5272e542b))
      - [PurelyFunctional.tv Newsletter](https://purelyfunctional.tv/newsletter/) by Eric Normand ([older issues](https://purelyfunctional.tv/newsletter-archives/))
  - Podcasts
      - [Cognicast](https://blog.cognitect.com/cognicast/) by Cognitect, the company behind Clojure - interviews with interesting people
      - [defn](https://defn.audio/) - "A loud, irreverent podcast discussing the delights of Clojure, ClojureScript with leaders and folks of the Community"



Beginner-friendly tools


  - Beginner-friendly all-in-one IDE: [Nightcode](https://sekao.net/nightcode/) and (simpler, web-based) [Lightmod](https://sekao.net/lightmod/)
  - [Luminus](https://www.luminusweb.net/) - web "framework," i.e. a curated and integrated set of libraries for web (backend and frontend) development in Clojure(Script) (developer tools, logging, security etc). So that you don't need to assemble your own.
  - Editing code
      - [Parinfer](https://shaunlebron.github.io/parinfer/) - provides for efficient and simple structural editing of Clojure/Lisp code using just Tab (compared to the older Paredit with its numerous key-bindings). A must-have for efficient and productive experience with any Lisp.
  - Building and running code
      - [Ultra](https://github.com/venantius/ultra) - a Leiningen (the primary Clojure build tool) plugin for an absolutely kick-ass development environment (i.e. REPL) - better stack-traces (via [Pretty](https://github.com/AvisoNovate/pretty)), human-friendly test output, colors, syntax-highlighting.






# Style and best practices




### Core




  - [Threading do's and don'ts](https://stuartsierra.com/2018/07/06/threading-with-style): use -\> and -\>\> only for navigation or transformation; prefer to keep the same type (but the last transf.) - break if necessary; avoid anonymous functions to change order type - likely doing to much already (if really necessary, use as-\> which is intended to be used exactly & only inside -\>).




# Resources




### Learning




  - [Tetris in ClojureScript](https://shaunlebron.github.io/t3tr0s-slides/) ([GitHub](https://github.com/shaunlebron/t3tr0s-slides); 2014+) - reportedly a great, interactive intro to the langs
  - [Open Source Clojure Tasks and Projects](https://www.longstorm.org/weekly/cito/1/) - a weekly newsletter of suitable, learning-friendly tasks
  - [A list of Clojure projects which have tags that indicate novice Clojurists could contribute to them](https://github.com/marcuscreo/clojure-learning-resources) by Marcus Blankenship




### Libs



Convenience libraries - the missing "features" of clojure.core etc.


  - [ztellman / potemkin](https://github.com/ztellman/potemkin/) - "*a collection of facades and workarounds for things that are more difficult than they should be*" - f.ex. *import-vars* so that we can expose a single namespace with everything to users while having the code split in multiple files, *def-map-type* so that we only need to implement the 4 essential functions, *def-derived-map* - as a view on another object, f.ex. JavaBean, *definterface+* - same syntax as defprotocol but creating an interface with its memory/performance benefits =\> easy to switch, *fast-memoize* and more
  - [cloojure/tupelo](https://github.com/cloojure/tupelo) (and [cloojure/tupelo-datomic](https://github.com/cloojure/tupelo-datomic)) - convenience features "missing" from clojure.core - e.g. the awesome (spy\[x\[x\]\]) for logging the expression \[+type\] going through a threading macro or a fn, ...)
  - [marick/suchwow](https://github.com/marick/suchwow) - *Functions and behaviors not present in Clojure core. Support for creating and using your own "favorite functions" namespace. Better docstrings for clojure.core functions. More expansive versions of clojure.core functions.*
  - [plumatic/plumbing](https://github.com/plumatic/plumbing) - *Prismatic's Clojure(Script) utility belt* (including Graph - *a simple and declarative way to specify a structured computation*)
  - [weavejester/medley](https://github.com/weavejester/medley) - *A lightweight library of useful Clojure(Script) functions (a tighter focus than useful and plumbing, and limits itself to a small set of general-purpose functions.)*
  - [flatland/useful](https://github.com/flatland/useful)
  - [nathanmarz/specter](https://github.com/nathanmarz/specter) - querying and manipulation of complex, nested data structures made easy



Web


  - [Sente - Clojure(Script) + core.async + WebSockets/Ajax](https://github.com/ptaoussanis/sente) - a tiny 600 LoC library for websockets (with fall-back to long-polling) communication between ClojureScript frontend and clojure backend, using EDN, support for request-reply and multiple user windows/tabs ([comparison with Chord](https://groups.google.com/forum/m/#!msg/clojure/5J4L8pbGwGU/O1RSsiKE_JUJ) (no non-WS fallback or req/resp))




### Development in general



Essential


  - [Timo Mihaljov's Pimp My REPL](https://dev.solita.fi/2014/03/18/pimp-my-repl.html) (3/2014)- really great tips - user.clj, :dev profile, user-wide config in .lein/profiles.clj, tools.namespace, making funs available everywhere & more via Vinyasa, form println with Spyscope, debug-repl, difform, clj-ns-browser (see also [lein-shorthand](https://github.com/palletops/lein-shorthand) and its library version [dot-slash-2](https://github.com/gfredericks/dot-slash-2) \[actively developed at least in 2017\])
  - Stuart Sierra's [My Clojure Workflow, Reloaded](https://thinkrelevance.com/blog/2013/06/04/clojure-workflow-reloaded) (6/2013) and the derived [reloaded lein template](https://github.com/stuartsierra/reloaded) and the [component library](https://github.com/stuartsierra/component) (and the lein template [reloadable-app](https://github.com/mowat27/reloadable-app) to build projects using component)
  - B. Batsov’s [Clojure Style Guide](https://github.com/bbatsov/clojure-style-guide#readme) (based on JoC etc.) at GitHub
  - Add dependencies dynamically to a running JVM - [pomegranate](https://github.com/cemerick/pomegranate) and its *add-dependencies* (and [Alembic](https://github.com/pallet/alembic) that wraps it and tries to avoid conflicts between project's and its dependencies - but not maintained since 2016)



ClojureScript


  - [Chestnut](https://github.com/plexus/chestnut) (10/2014) - A Leiningen template for a Clojure/ClojureScript app based on Om, featuring a great dev setup, and easy deployment. Highlight: well-functioning browser-connected REPL, see [a demo by D. Nolen](https://swannodette.github.io/2014/10/10/magic/) who labels it "one of the coolest bits of ClojureScript tech I've encountered in a very long time." The REPL is "always ready to go even if you kill the web server, refresh the web page, or have a JS exception on the page." and there is live reload upon file change without corrupting the app state.
  - [lein-figwheel](https://github.com/bhauman/lein-figwheel) - Figwheel builds your ClojureScript code and hots loads it into the browser as you are coding - live code and CSS reloading
  - [weasel](https://github.com/tomjakubowski/weasel) - WebSocket-connected REPL environment for ClojureScript - especially useful if the standard REPL doesn't work because the page does not allow for iframes and/or does not use http://
  - [clj-devtools](https://github.com/binaryage/cljs-devtools/blob/master/readme.md) - Better presentation of ClojureScript values in Chrome DevTools



Testing


  - [juxt iota](https://github.com/juxt/iota) - simplify running multiple checks on a (complex) data structure



Data


  - [Typed Clojure](https://typedclojure.org/)

  - [Prismatic Schema](https://github.com/Prismatic/schema)

  - [structural-typing](https://github.com/marick/structural-typing/wiki) - runtime data checks similar to Schema, inspired by Elm. '*Tailored to "flow-style" programming, where complex structures flow through a series of functions, each of which makes a smallish change.*' Highlights: (1) Extra keys are to be preserved but not otherwise meddled with. (2) We want to check more then types (e.g. is a num in a range?)

  - [Balagan, Clojure (Script) data transformation and querying library](https://github.com/clojurewerkz/balagan/blob/master/README.md) ClojureWerkz - this is something I’ve been looking for in quite a while. Ex.:

        (b/select {:a {:b {:c 1}} ..} [:a :* :c] (fn [val path] ...))

  - [DataScript](https://github.com/tonsky/datascript) - Immutable database and [Datalog](https://en.wikipedia.org/wiki/Datalog) query engine for Clojure, ClojureScript and JS

  - [Specter](https://github.com/nathanmarz/specter) (Clj(s))- queries and transformations on complex/nested data structures made extremely concise and elegant

  - [Use Datomic’s Datalog to query data structures](https://gist.github.com/stuarthalloway/2645453)



Utilities


  - [clojure/tools.trace](https://github.com/clojure/tools.trace) - trace calls, f.ex. run *(trace-ns my.ns)* to print call with params and return value of each function
  - [Schmetterling - Debug running clojure processes](https://github.com/marick/structural-typing) from the browser\! - upon an exception, the process will pause and S. will show the stack, which you can navigate and see locals and run code in the context of any stack frame; you can also trigger it from your code. It can be used nicely also in pre/post-conditions.



Lein


  - [lein-ancient](https://github.com/xsc/lein-ancient) - analyzes your `project.clj` and lets you know which dependencies are out of date.
  - [lein-try](https://github.com/rkneufeld/lein-try) - start a REPL with various dependencies without needing a project. Great for exploring new libraries\!
  - [Eastwood](https://github.com/jonase/eastwood) - a lint tool for Clojure.
  - [lein-shorthand](https://github.com/palletops/lein-shorthand) - a plugin to make useful functions (such as pprint, source) accessible in any namespace by copying them into a new namespace . so you can invoke (./pprint ...).




### Lib catalog




  - [clojure-toolbox.com](https://www.clojure-toolbox.com/)
  - [clojurewerkz.org](https://clojurewerkz.org/)




### From Clojure to Java




  - [UncleJim ("Unmodifiable Collections for Java™ Immutability")](https://github.com/GlenKPeterson/UncleJim)  is a very interesting looking library, with these main features:
      - Type-safe versions of Clojure’s immutable collections, implementing the generic java.util collection interfaces.
      - A simplified immutable alternative to Java 8 Streams, wrapping checked exceptions and avoiding primitives.
      - A tiny, type-safe data definition language of brief helper functions: vec(), set(), map(), and tup(), (like Clojure’s vector \[\], set \#{}, and map {}).
      - Extend Tuples to make your own immutable Java classes (with correct equals(), hashCode(), and toString() implementations) almost as easily as writing case classes in Scala.




# ClojureScript



Cljs: 23kB

(-\> (dom/getElement "app")
(dom/setTextContent (join ", " \["Hello" "World\!"\])))

jQuery: 29kB (+ 45kB Immutable.js)

$("\#app").text(
\["Hello", "World"\].join(", "));

Source: [SeatleJS - ClojureScript for Skeptics by @derekslager](https://drive.google.com/file/d/0B8PcNdmU12GXVmdYeHNFU2hYc28/view)
