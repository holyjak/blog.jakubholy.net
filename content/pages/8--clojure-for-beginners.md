---
title: "Clojure for beginners"
---

The key information, resources, community places, tools, and tricks you as a starting Clojure developer will find helpful.

(See the [Clojure page](/clojure) for more and more general stuff.)

### How to become truly productive in Clojure

You can be very productive with Clojure, much more than e.g. in Java thanks to its interactive development, simplicity, and powerful tools such as macros. However there are some preconditions, as Eric Normand writes in [PurelyFunctional.tv Newsletter 266](https://purelyfunctional.tv/issues/purelyfunctional-tv-newsletter-266-beginner-experience/):

> When you don't have the stuff above (paren\[these\] management, integrated REPL, hot code reloading, and experience debugging the errors), the \[development\] cycle can be much slower than the descendants of punchcard languages.

So to really experience the productivity and pleasure of Clojure(Script), you need:

0. Learn and fully embrace [REPL-driven development](https://clojure.org/guides/repl/introduction) (and debugging). Don't underestimate this, it is a fundamental shift of how you develop. Most people struggle with this mind shift for a while.
1.  A tool to enable effective, productive (structural) editing of Clojure code, such as [Parinfer](https://shaunlebron.github.io/parinfer/) (integrated in all popular Clojure editors)
2.  A good editor with an integrated REPL so that you can evaluate your code and interact with your running application in a frictionless way. Cursive (paid for commercial use) and Emacs (powerful but very steep and long learning curve) are the most popular, but there are also special ones for beginners such as [Nightcode](https://sekao.net/nightcode/) and (simpler, web-based) [Lightmod](https://sekao.net/lightmod/). (Many editors have some Clojure support but the quality and depth and thus user experience vary a lot.)
3.  ClojureScript: hot code reloading (which [shadow-cljs](http://shadow-cljs.org/) does perfectly (together with everything else you might need for frontend development)).
4.  Experience debugging errors - sadly you have to learn that though tools such as Ultra/Pretty (see below) and [Expound](https://github.com/bhb/expound) for Spec do help. [Pyro](https://github.com/venantius/pyro) also looks great.
5. Not to hesitate to ask for help and advice at the Clojurians Slack community :-)
6. [Understand Clojure philosophy][CljPhil] and the Clojure way to approach and solve problems. Don't try to apply what you learned in OOP/..., that would hurt. Understand the core principles and their benefits and downsides.

### Learning Clojure

Learning Clojure is reportedly both easy and quick and a long-term process. New developers can start writing code within a few weeks but it might take months or years to master
or Clojure core functions (you just keep stumbling on treasures in the core library) and to undo your OOP learning and start designing FP systems.

##### Getting started

The free online book [Clojure for the Brave and True](https://www.braveclojure.com/) has been highly recommended to me for beginners.
To get your hands dirty, go through the programming exercises at [4clojure](http://www.4clojure.com/) and/or
through the even more beginner (and non-programmer) friendly [Maria: learn Clojure with Shapes](https://www.maria.cloud/intro).

Always keep the [Clojure Cheatsheet](http://jafingerhut.github.io/cheatsheet/grimoire/cheatsheet-tiptip-cdocs-summary.html) close by
and read through it (and the referenced resources) regularly. Make sure to study the
[Programming at the REPL](https://clojure.org/guides/repl/introduction) guide early on (and perhaps invest in Eric Normand's
video course [Repl-Driven Development in Clojure](https://purelyfunctional.tv/courses/repl-driven-development-in-clojure/); the first lesson is free, so check it out.)

I would also highly recommend reading the first chapter about [Clojure philosophy from Joy of Clojure][CljPhil].

Last but not least: remember that you don't need to learn all at once. You will most likely never need [STM](https://clojure.org/reference/refs) or
[agents](https://clojure.org/reference/agents) ([atoms](https://clojure.org/reference/atoms) are perfect for perhaps 99% state management needs, use [core.async](https://github.com/clojure/core.async) for non-trivial async needs)
so feel free to skip those, at least for now. [Datatypes and protocols](https://clojure.org/reference/datatypes) and [multimethods](https://clojure.org/reference/multimethods)
are something you will eventually need but you can likely get very far without them. Similarly, [macros](https://clojure.org/reference/macros), [transients](https://clojure.org/reference/transients),
[transducers](https://clojure.org/reference/transducers), [reducers](https://clojure.org/reference/reducers), [compilation and class generation](https://clojure.org/reference/compilation)
can wait until you need them, certainly a few months.

##### Leveling up

Ok, so you know the language and want to learn how to create systems and to deepen your understanding. Check out these:

* [Clojure Applied: From Practice to Practitioner](https://www.amazon.com/dp/1680500740/ref=cm_sw_r_cp_ep_dp_vEbkAbT77MYME) by Ben Vandgrift, Alex Miller (2015) - even in 2019 this is the best and still highly relevant
  book about building systems in Clojure, tackling topics such as namespace organization, creating and connecting components, composing applications, handling configuration.
* [Elements of Clojure](https://leanpub.com/elementsofclojure) by Zachary Tellman (2018) - "It provides a framework for making better design choices, and a vocabulary for teams to discuss the software they collaborate on."
* [Programming Clojure 3rd edition](https://www.amazon.com/dp/1680502468/ref=cm_sw_r_cp_ep_dp_GKzJAb11S07VA) by Alex Miller, Stuart Halloway, Aaron Bedra (2018) - a handy, comprehensive reference

See [all Clojure books](https://clojure.org/community/books) at the Clojure site.

### Resources for beginners

Official sources

  - [Clojure.org](https://clojure.org/) and its [References](https://clojure.org/reference/reader) and [Guides](https://clojure.org/guides/getting_started).
    - Especially the [Programming at the REPL](https://clojure.org/guides/repl/introduction) guide is essential
  - [ClojureScript.org](https://clojurescript.org/) and its [References](https://clojurescript.org/reference/documentation) and [Guides](https://clojurescript.org/guides/quick-start).

Help & learning

  - [Clojure Cheatsheet](http://jafingerhut.github.io/cheatsheet/grimoire/cheatsheet-tiptip-cdocs-summary.html) and [ClojureScript Cheatsheet](http://cljs.info/cheatsheet/)
  - [ClojureDocs](https://clojuredocs.org/) - the language function documentation with examples
  - [cljdoc](https://cljdoc.org/) - documentation and API docs of Clojure libraries
  - [4clojure](http://www.4clojure.com/) - learn Clojure by solving small task and comparing your solution with others (you may also like [Clojure koans](http://www.clojurekoans.com/))
  - [Maria: learn Clojure with Shapes](https://www.maria.cloud/intro) - a cool, beginner-friendly ClojureScript notebook-style editor with a built-in introduction to Clojure(Script) using graphical programming

Community, advice, fora

  - [Clojurians](http://clojurians.net/) - the official Slack organization with channels for Clojure, ClojureScript, and most popular libraries and topics. Leading developers and authors often answer questions.
  - [Clojure](https://groups.google.com/forum/#!forum/clojure) and [ClojureScript Google Groups](https://groups.google.com/forum/#!forum/clojurescript) - for advice, announcements, keeping informed
  - [Clojureverse](https://clojureverse.org/) - friendly discussion fora
  - Newsletters to keep updated about the latest development, useful libraries, etc.
      - [The REPL](https://therepl.net/) by Daniel Compton ([older issues](https://us7.campaign-archive.com/home/?u=fef380870c4a5633a21f55d8e&id=b5272e542b))
      - [PurelyFunctional.tv Newsletter](https://purelyfunctional.tv/newsletter/) by Eric Normand ([older issues](https://purelyfunctional.tv/newsletter-archives/))
  - Podcasts
      - [Cognicast](http://blog.cognitect.com/cognicast/) by Cognitect, the company behind Clojure - interviews with interesting people
      - [defn](https://defn.audio/) - "A loud, irreverent podcast discussing the delights of Clojure, ClojureScript with leaders and folks of the Community"

[CljPhil]: https://livebook.manning.com/#!/book/the-joy-of-clojure-second-edition/chapter-1/

### Beginner-friendly tools and starting packages

  - Beginner-friendly, all-in-one. getting-started IDEs: [Nightcode](https://sekao.net/nightcode/) and (simpler, web-based) [Lightmod](https://sekao.net/lightmod/)
  - Professional dev environments: The most popular tools for developing in Clojure(Script) are [Emacs with Cider](https://docs.cider.mx) and [IntelliJ with Cursive](https://cursive-ide.com/).
    But people also use [VS Code with Calva](https://marketplace.visualstudio.com/items?itemName=cospaia.clojure4vscode) (and [Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer)) and [Atom](https://atom.io/) with [Chlorine](https://atom.io/packages/chlorine).
  - Web dev: [Luminus](http://www.luminusweb.net/) is the recommended web "framework," i.e. a curated and integrated set of libraries for web (backend and frontend) development in Clojure(Script) (developer tools, logging, security etc). So that you don't need to assemble your own.
  - Editing code
      - [Parinfer](https://shaunlebron.github.io/parinfer/) - provides for efficient and simple structural editing of Clojure/Lisp code using just Tab (compared to the older Paredit with its numerous key-bindings). A must-have for efficient and productive experience with any Lisp.
  - Building and running code
      - [Ultra](https://github.com/venantius/ultra) - a Leiningen (the primary Clojure build tool) plugin for an absolutely kick-ass development environment (i.e. REPL) - better stack-traces (via [Pretty](https://github.com/AvisoNovate/pretty)), human-friendly test output, colors, syntax-highlighting.
