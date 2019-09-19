---
title: "Clojure"
---
Clojure-related resources and notes.

New to Clojure? Check [Clojure for beginners](/clojure-for-beginners) first!

Content:

 * [Why Clojure(Script)?](#why-clojurescript)
 * [REPL-driven development](#repl-driven-development)
 * [Style and best practices](#style-and-best-practices)
 * [Resources](#resources) - learning, libs, etc.
 * [ClojureScript](#clojurescript)

# Why Clojure(Script)?

> Clojure(Script) is simpler yet more expressive (than Java(Script))
> *- paraphrase of David Nolan in [ClojureScript Next](http://swannodette.github.io/2015/07/29/clojurescript-17/)*

Clojure (and thus ClojureScript) is one of the **best designed** programming languages, it is really well thought-through and great care is taken to ensure that the pieces do each a different thing yet fit perfectly together. It has been designed after years of painful experiences with production systems in Java, C++, Common Lisp and others to avoid the main sources of complexity and maintenance headaches. (For details see the [Clojure Rationale](https://clojure.org/about/rationale) and talks by Rich Hickey such as [Effective Programs - 10 Years of Clojure](https://www.youtube.com/watch?v=2V1FtfBDsLU).) It is also **pragmatic**, focused on getting stuff done, and it enables **productive development** thanks to tight feedback loops and powerful constructs. Its strength is data processing and thus it shines most in web services and applications, data analysis and processing pipelines, and similar.

Clojure enables **interactive programming** - you can connect a REPL to your application and develop it and interact with it from code _while it is running_. You cannot imagine the power and the insanely short feedback loop until you experience it. See the short screencast [Interactive programming Flappy Bird in ClojureScript](https://www.youtube.com/watch?v=KZjFVdU8VLI) for an idea. Other languages also have REPL but Clojure was designed for evolving running applications in the REPL while managing state through these changes.

It has performant **immutable data structures** that make many concurrency-related defects impossible.

It has a powerful **library of data transformation** functions that can be effectively combined together.

When necessary, you can use **macros** to remove duplication and fit the language to your problem.

No matter whether you use Clojure core or a library, they use the ±4 generic Clojure data structures - that you can access and transform through the core functions you know and love. No more learning a custom API for every library\! (Though you still need to learn and understand its data.)

It has also **[core.async](http://clojure.com/blog/2013/06/28/clojure-core-async-channels.html)** for asynchronous/reactive programming,  **[clojure.spec](https://clojure.org/about/spec)** to document, verify, use and test your data, and much more.

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

# REPL-driven development

See the [official REPL development guide](https://clojure.org/guides/repl/introduction) and Eric Normand's [Repl-Driven Development in Clojure](https://purelyfunctional.tv/courses/repl-driven-development-in-clojure/) video course.

### Avoiding inconsistent state

While changing things, you can end up with old state/vars still being available though they are not in the code anymore. So you can f.ex. call a function that doesn't exist anymore. Restarting REPL to clear the environment isn't a good solution because it takes time. Alternatives:

#### A. Unloading of changed namespaces

See [Reloading Woes](https://lambdaisland.com/blog/2018-02-09-reloading-woes) (2/2018). You can use clojure.tools.namespace, namely its `unload` to completely forget everything about a namespace - though this will also reset all your state, if any, despite `defonce`.

#### B. Careful coding practices and tests

You can employ a few tricks (such as preceding each `(defmulti multi-fn ..)` with `(def multi-fn nil)`) and detect stale code / wrong order by continually running your code outside of the REPL, f.ex. by creating an (initially) empty test for each namespace and have a runner run it - thus loading your code - upon each change. Sean [Corfield described this approach in 4/2019](https://clojureverse.org/t/what-are-the-alternatives-to-using-remove-ns-to-clean-up-definitions/4121/19):

> FWIW, I’ve never needed any sort of “refresh all” in my workflow. I have a REPL running with all the dependencies of our monorepo across a dozen or so subprojects, and it runs for days and days and days. I probably restart it once a week at most…
>
> [...]
>
> Yes, we use Component very heavily. No, we don’t use its reset function.
>
> No, I don’t run into problems with multimethods: you can use (def multi-fn nil) to remove a multimethod definition so it can be predictably redefined (putting that above your defmulti should be enough).
>
> No, I don’t run into problems with ordering in namespaces. I suspect that’s a combination of 8+ years of Clojure experience, being careful to check for first use of functions when I do move things around, and never typing directly into the REPL (I always eval code from a source file, so I use “Rich Comment Forms” for non-production/exploratory code in my source files).
>
> Also, we have a stub test namespace for every single source file so when we run clj -A:test:runner we get a failure if there’s an ordering problem – and we run our automated tests a lot, locally! We have a script that generates a stub test namespace for any source file that doesn’t already have one: it requires the source namespace and refers all symbols as a baseline for “can this source file be loaded” successfully.
>
> Perhaps another aspect of my workflow that helps with all this: whenever I change any code at all, I always eval the top-level form that it’s in – so the REPL always has the up-to-date version of my code. That’s just habit, but it’s also part of a good REPL-Driven Development workflow: make small changes and always test every change in the REPL as you go. That means that instead of making a slew of changes across multiple namespaces and hoping you got it all correct, you work from the bottom up, testing each changed file as you go.

There are also a few built-in tools you can use to clean up some state:

* [`ns-unmap`](https://clojuredocs.org/clojure.core/ns-unmap) - "Removes the mappings for the symbol from the namespace."
* [`remove-ns`](https://clojuredocs.org/clojure.core/remove-ns) - "Removes the namespace named by the symbol. Use with caution." A "nuclear" option that I use sometimes. You might be unable to require it again with the same alias unless you `remove-ns` (and reload) also the current, requiring ns.

# Style and best practices

### Core

  - [Threading do's and don'ts](https://stuartsierra.com/2018/07/06/threading-with-style): use -\> and -\>\> only for navigation or transformation; prefer to keep the same type (but the last transf.) - break if necessary; avoid anonymous functions to change order type - likely doing too much already (if really necessary, use as-\> which is intended to be used exactly & only inside -\>).

# Resources

### Community

 - [Clojurists Together](https://www.clojuriststogether.org/) - help to fund key projects via C.T. grants or by [directly supporting selected projects](https://www.clojuriststogether.org/beyond/).

### Learning

  - [Tetris in ClojureScript](http://shaunlebron.github.io/t3tr0s-slides/) ([GitHub](https://github.com/shaunlebron/t3tr0s-slides); 2014+) - reportedly a great, interactive intro to the langs
  - [Open Source Clojure Tasks and Projects](http://www.longstorm.org/weekly/cito/1/) - a weekly newsletter of suitable, learning-friendly tasks
  - [A list of Clojure projects which have tags that indicate novice Clojurists could contribute to them](https://github.com/marcuscreo/clojure-learning-resources) by Marcus Blankenship

### Lib catalog

  - [clojure-toolbox.com](http://www.clojure-toolbox.com/)
  - [clojurewerkz.org](http://clojurewerkz.org/) - a collection of high-quality projects by ClojureWerkz

### Libs

#### Convenience libraries - the missing "features" of clojure.core etc.

  - [ztellman / potemkin](https://github.com/ztellman/potemkin/) - "*a collection of facades and workarounds for things that are more difficult than they should be*" - f.ex. *import-vars* so that we can expose a single namespace with everything to users while having the code split in multiple files, *def-map-type* so that we only need to implement the 4 essential functions, *def-derived-map* - as a view on another object, f.ex. JavaBean, *definterface+* - same syntax as defprotocol but creating an interface with its memory/performance benefits =\> easy to switch, *fast-memoize* and more
  - [cloojure/tupelo](https://github.com/cloojure/tupelo) (and [cloojure/tupelo-datomic](https://github.com/cloojure/tupelo-datomic)) - convenience features "missing" from clojure.core - e.g. the awesome (spy\[x\[x\]\]) for logging the expression \[+type\] going through a threading macro or a fn, ...)
  - [marick/suchwow](https://github.com/marick/suchwow) - *Functions and behaviors not present in Clojure core. Support for creating and using your own "favorite functions" namespace. Better docstrings for clojure.core functions. More expansive versions of clojure.core functions.*
  - [plumatic/plumbing](https://github.com/plumatic/plumbing) - *Prismatic's Clojure(Script) utility belt* (including Graph - *a simple and declarative way to specify a structured computation*)
  - [weavejester/medley](https://github.com/weavejester/medley) - *A lightweight library of useful Clojure(Script) functions (a tighter focus than useful and plumbing, and limits itself to a small set of general-purpose functions.)*
  - [flatland/useful](https://github.com/flatland/useful)
  - [nathanmarz/specter](https://github.com/nathanmarz/specter) - querying and manipulation of complex, nested data structures made easy
  - parallelism:
    - [claypoole](https://github.com/TheClimateCorporation/claypoole) - variants of `future/pmap/for` backed by _configurable_ threadpool(s) (Clojure uses a fixed-size threadpool shared by all, `core.async` is an overkill, reducers are not configurable)
    - [tesser](https://github.com/aphyr/tesser) - "_Clojure reducers, but for parallel execution: locally and on distributed systems [hadoop]._" Also has parallelized math/statistical aggregations.

#### Web

  - [Sente - Clojure(Script) + core.async + WebSockets/Ajax](https://github.com/ptaoussanis/sente) - a tiny 600 LoC library for websockets (with fall-back to long-polling) communication between ClojureScript frontend and clojure backend, using EDN, support for request-reply and multiple user windows/tabs ([comparison with Chord](https://groups.google.com/forum/m/#!msg/clojure/5J4L8pbGwGU/O1RSsiKE_JUJ) (no non-WS fallback or req/resp))

#### Other libs

##### Testing

  - [juxt iota](https://github.com/juxt/iota) - simplify running multiple checks on a (complex) data structure
  - [specmonstah](https://github.com/reifyhealth/specmonstah) - use the power of clojure.spec to set up unit test fixtures, generating and manipulating deeply-nested, hierarchical graphs of business data

##### Data

  - [Typed Clojure](http://typedclojure.org/)
  - [Prismatic Schema](https://github.com/Prismatic/schema)
  - [structural-typing](https://github.com/marick/structural-typing/wiki) - runtime data checks similar to Schema, inspired by Elm. '*Tailored to "flow-style" programming, where complex structures flow through a series of functions, each of which makes a smallish change.*' Highlights: (1) Extra keys are to be preserved but not otherwise meddled with. (2) We want to check more then types (e.g. is a num in a range?)
  - [Balagan, Clojure (Script) data transformation and querying library](https://github.com/clojurewerkz/balagan/blob/master/README.md) ClojureWerkz - this is something I’ve been looking for in quite a while. Ex.:

        (b/select {:a {:b {:c 1}} ..} [:a :* :c] (fn [val path] ...))
  - [DataScript](https://github.com/tonsky/datascript) - Immutable database and [Datalog](https://en.wikipedia.org/wiki/Datalog) query engine for Clojure, ClojureScript and JS
  - [Specter](https://github.com/nathanmarz/specter) (Clj(s))- queries and transformations on complex/nested data structures made extremely concise and elegant
  - [Use Datomic’s Datalog to query data structures](https://gist.github.com/stuarthalloway/2645453)
  - [tupelo.forest](https://github.com/cloojure/tupelo/) - searching & manipulating tree-like data structures ([examples](https://github.com/cloojure/tupelo/blob/master/test/clj/tst/tupelo/forest_examples.clj))

Interop

 - [bean-dip](https://github.com/uwcpdx/bean-dip) - Bidirectional translation between Clojure maps and Java beans that's declarative and reflection-free (contrary to clojure.core/bean, java.data, gavagi - see the README for a comparison)

### Development in general

Essential

  - [Timo Mihaljov's Pimp My REPL](http://dev.solita.fi/2014/03/18/pimp-my-repl.html) (3/2014)- really great tips - user.clj, :dev profile, user-wide config in .lein/profiles.clj, tools.namespace, making funs available everywhere & more via Vinyasa, form println with Spyscope, debug-repl, difform, clj-ns-browser (see also [lein-shorthand](https://github.com/palletops/lein-shorthand) and its library version [dot-slash-2](https://github.com/gfredericks/dot-slash-2) \[actively developed at least in 2017\])
  - Stuart Sierra's [My Clojure Workflow, Reloaded](http://thinkrelevance.com/blog/2013/06/04/clojure-workflow-reloaded) (6/2013) and the derived [reloaded lein template](https://github.com/stuartsierra/reloaded) and the [component library](https://github.com/stuartsierra/component) (and the lein template [reloadable-app](https://github.com/mowat27/reloadable-app) to build projects using component)
  - B. Batsov’s [Clojure Style Guide](https://github.com/bbatsov/clojure-style-guide#readme) (based on JoC etc.) at GitHub
  - Add dependencies dynamically to a running JVM - [pomegranate](https://github.com/cemerick/pomegranate) and its *add-dependencies* (and [Alembic](https://github.com/pallet/alembic) that wraps it and tries to avoid conflicts between project's and its dependencies - but not maintained since 2016)
  - [Cambium - The Power of Clojure: Debugging][Cambium] by Ian Truslove (2018) - in depth guide on REPL-based debugging in Clojure, both with and without extra tools, with great links

ClojureScript


  - [Chestnut](https://github.com/plexus/chestnut) (10/2014) - A Leiningen template for a Clojure/ClojureScript app based on Om, featuring a great dev setup, and easy deployment. Highlight: well-functioning browser-connected REPL, see [a demo by D. Nolen](http://swannodette.github.io/2014/10/10/magic/) who labels it "one of the coolest bits of ClojureScript tech I've encountered in a very long time." The REPL is "always ready to go even if you kill the web server, refresh the web page, or have a JS exception on the page." and there is live reload upon file change without corrupting the app state.
  - [lein-figwheel](https://github.com/bhauman/lein-figwheel) - Figwheel builds your ClojureScript code and hots loads it into the browser as you are coding - live code and CSS reloading
  - [weasel](https://github.com/tomjakubowski/weasel) - WebSocket-connected REPL environment for ClojureScript - especially useful if the standard REPL doesn't work because the page does not allow for iframes and/or does not use http://
  - [clj-devtools](https://github.com/binaryage/cljs-devtools/blob/master/readme.md) - Better presentation of ClojureScript values in Chrome DevTools

Debugging and troubleshooting

  - [clojure/tools.trace](https://github.com/clojure/tools.trace) - trace calls, f.ex. run *(trace-ns my.ns)* to print call with params and return value of each function
  - [Schmetterling - Debug running clojure processes](https://github.com/marick/structural-typing) from the browser\! - upon an exception, the process will pause and S. will show the stack, which you can navigate and see locals and run code in the context of any stack frame; you can also trigger it from your code. It can be used nicely also in pre/post-conditions.
  - [miracle.save](https://github.com/Saikyun/miracle.save) - automatically save arguments and return values of selected functions / all in a ns.
  - [scope-capture](https://github.com/vvvvalvalval/scope-capture) - help you save and restore the local environment of a piece of code with minimal effort. (Wrap an expression in `spy` to save, fns to restore into `def`s or a `let`; `brk`-point to pause the execution.)

Lein

  - [lein-ancient](https://github.com/xsc/lein-ancient) - analyzes your `project.clj` and lets you know which dependencies are out of date.
  - [lein-try](https://github.com/rkneufeld/lein-try) - start a REPL with various dependencies without needing a project. Great for exploring new libraries\!
  - [Eastwood](https://github.com/jonase/eastwood) - a lint tool for Clojure.
  - [lein-shorthand](https://github.com/palletops/lein-shorthand) - a plugin to make useful functions (such as pprint, source) accessible in any namespace by copying them into a new namespace . so you can invoke (./pprint ...).

### From Clojure to Java

  - [UncleJim ("Unmodifiable Collections for Java™ Immutability")](https://github.com/GlenKPeterson/UncleJim)  is a very interesting looking library, with these main features:
      - Type-safe versions of Clojure’s immutable collections, implementing the generic java.util collection interfaces.
      - A simplified immutable alternative to Java 8 Streams, wrapping checked exceptions and avoiding primitives.
      - A tiny, type-safe data definition language of brief helper functions: vec(), set(), map(), and tup(), (like Clojure’s vector \[\], set \#{}, and map {}).
      - Extend Tuples to make your own immutable Java classes (with correct equals(), hashCode(), and toString() implementations) almost as easily as writing case classes in Scala.

# ClojureScript

Cljs: 23kB

```
(-> (dom/getElement "app")
(dom/setTextContent (join ", " ["Hello" "World\!"])))
```

jQuery: 29kB (+ 45kB Immutable.js)

```
$("#app").text(["Hello", "World"\.join(", "));
```

Source: [SeatleJS - ClojureScript for Skeptics by @derekslager](https://drive.google.com/file/d/0B8PcNdmU12GXVmdYeHNFU2hYc28/view)
