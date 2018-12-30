---
title: "Development"
---
_(See the [parent page](/wiki/) with its global index for development-related subpages.)_

### Snippets & Tips

#### Bash

##### Loop from 00 til 11

```
for i in $(seq -f '%02g' 2 14); do ... done
```

### Remote pair-programming tools

What people use:

1. Screensharing (VNC, newer [NX](http://nomachine.com/), Skype, Google+ etc.) - high-bandwidth, not responsive enough
2. ssh + screen/tmux and G+ for audio/video - low bandwidth, responsive, text/terminal only - popular with vim
3. Special tools
  1. [Eclipse ECF](http://www.eclipse.org/ecf/) should be usable for remote pair-programming, how is unclear from its docs ([DocShare](http://wiki.eclipse.org/DocShare_Plugin) (old) /[RT Shared Editing](http://wiki.eclipse.org/RT_Shared_Editing) (old too?)?)
  2. [Saros - Eclipse plugin](http://www.saros-project.org/) for distributed collaborative software development (last 12/2012?)
  3. [ProxyLocal](https://github.com/proxylocal/proxylocal-gem#readme) - proxies your local web-server and makes it publicly available over the internet - useful e.g. when doing web development
  4. [Emacs + Rudel](http://emacswiki.org/emacs/Rudel) ([experience report, 2009](http://technomancy.us/129))

* PivotLabs:[how we use tmux for remote pair programming](http://pivotallabs.com/how-we-use-tmux-for-remote-pair-programming/) (6/2012) - with vim, many config tips including tuning mouse support (a [useful tmux book](http://pragprog.com/book/bhtmux/tmux)) +[Tech Talk on Remote Pairing](https://vimeo.com/51001103) (2012.10.05)
* Evan Light does lot of remote pair programming and [summarizes the experience](http://evan.tiggerpalace.com/articles/2011/10/17/some-people-call-me-the-remote-pairing-guy-/) (using G+ for A/V and Tmux plus some other tools such as ProxyLocal and DynDNS+DD-WRT; 2011)
* Jason Haruska has described [pros & cons of the different solutions](http://haruska.com/2009/09/29/remote-pair-programming-with-screen-and-vim/) (using screen+vim himself, 2009)
* [remotepairprogramming.com](http://remotepairprogramming.com/) - tool tips and setup etc.

## Coding

### Guidelines

#### Commit Message Guidelines

Follow the [50/70 format](http://stackoverflow.com/questions/2290016/git-commit-messages-50-72-formatting) as much as feasible:

```
Summarize clearly in one line what the commit is about (preferably less than 50 chars)

Describe the problem the commit solves or the use
case for a new feature. Justify why you chose
the particular solution.
(Preferably 70 chars per line)
```

* Write the summary line and description of what you have done in the imperative mode, that is as if you were commanding someone. Write "fix", "add", "change" instead of "fixed", "added", "changed".
* The summary must describe both what the patch changes, as well as why the patch might be necessary. It is challenging to be both succinct and descriptive, but that is what a well-written summary should do.
* Always leave the second line blank.
* Line break the commit message (to make the commit message readable without having to scroll horizontally in gitk, git log etc.).
* Try to keep the summary line to 50 chars, though this isn't a hard limit (The subject line is used all over Git, oftentimes in truncated form if too long. But f.ex. Linux uses ~ 70 chars also for the commit summary line)
* Feel free to use bulleted lists; ex.: "- list item" (let's us unite on using f.ex. -)

Gerrit has [read-worthy tips for the content of the message](http://www.mediawiki.org/wiki/Gerrit/Commit_message_guidelines) .

Sources: Tom Pope's blog about the [50/72 format](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html), [git-commit man page](https://www.kernel.org/pub/software/scm/git/docs/git-commit.html) (50 chars recommendation), [submitting patches guidelines for Git itself](http://git.kernel.org/cgit/git/git.git/tree/Documentation/SubmittingPatches?id=HEAD) (50, imperative), [SO](http://stackoverflow.com/questions/2290016/git-commit-messages-50-72-formatting), [Erlang/OTP](https://github.com/erlang/otp/wiki/Writing-good-commit-messages) guidelines.

## Online Resources

### Development best practices

* [Nathan Marz: Principles of Software Engineering, Part 1](http://nathanmarz.com/blog/principles-of-software-engineering-part-1.html) - Nathan has worked with Big Data at Twitter and other places and really knows the perils or large, distributed, real-time systems and this post contains plenty of valuable advice for making robust, reliable SW. Main message: "_there's a lot of **uncertainty** in software engineering_"; every SW operates correctly only for a certain range of inputs (including volume, HW it runs on, ...) and you never control all of them so there always is an opportunity for failure; you can't predict what inputs you will encounter in the wild. _"[..] while software is deterministic, you can't treat it as deterministic in any sort of practical sense if you want to build robust software._" "_**Making software robust is an iterative process**: you build and test it as best you can, but inevitably in production you'll discover new areas of the input space that lead to failure. Like rockets, it's **crucial to have excellent monitoring** in place so that these issues can be diagnosed._". From the content: Sources of uncertainty (bugs, humans, requirements, inputs, ..), Engineering for uncertainty (minimize dependencies, lessen % of cascading failure [JH: ->[Hystrix](https://github.com/Netflix/Hystrix)], measure and monitor)
  - [Suffering-oriented programming](http://nathanmarz.com/blog/suffering-oriented-programming.html) is certainly also worth reading (summary: do not start with great designs; only start generalizing and creating libs when you have suffered enough from doing things more manually and thus learned the domain; make it possible > make it beautiful > make it fast, repeat)
* Kent Beck:[Making Making CoffeeScript](https://www.youtube.com/watch?v=nIonZ6-4nuU) (screencast, 19min) - an inspiring demonstration of some key development practices: a super-short feedback loop, evolving and refactoring code in small steps without ever breaking it (->[Parallel Change](/wiki/development/parallel-design-parallel-change/ "Parallel Design (Parallel Change)")), TDD as a vessel of feadback, without a testing framework.

### Web dev

* [devdocs.io](http://devdocs.io/): "an all-in-one API documentation reader for [web] developers," navigable via keyboard - JS, HTML, CSS, DOM, DOM events, jQuery, Underscore.js

## Software Engineering

* [Seven deadly sins of talking about "types"](http://www.cl.cam.ac.uk/~srk31/blog/2014/10/07#seven-type-sins) by Dr Stephen Kell - what goes wrong in many static vs. dynamic typing discussions - worth being aware of before participating: 1. Not distinguishing abstraction from checking, 2. Pretending that syntactic overhead is the issue, 3. Patronising those outside the faith, 4. Presenting type-level programming as a good thing, 5. Fetishising Curry-Howard, 6. Equivocating around "type-safety," 7. Omitting the inconvenient truths. See also the essay ["In Search of Types"](http://www.cl.cam.ac.uk/~srk31/#onward14) attempts to be a dispassionate review of some of the different concepts, purposes and attitudes surrounding the word "type" in programming. "[..] they [type annotations] force you to structure your code around type-checkability. This is inevitable, since type checking is _by definition_ a specific kind of _syntactic_ reasoning." "Proof has a cost, and the appropriate expenditure depends on the task." "Type systems _cannot_ be a one-stop solution for specification and verification. They are limited by definition. They reason only syntactically, and they specify only at the granularity of expressions."
