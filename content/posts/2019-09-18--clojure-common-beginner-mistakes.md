---
title: "Clojure: Common beginner mistakes (WIP)"
category: "SW development"
tags: [clojure]
---

Common mistakes made by Clojure beginners and style recommendations.

<!--more-->

## Style

### Naming

1. Use snake-case-names, not camelCase or something else.
2. End predicates with `?`, i.e. ~`isAlien`~ -> `alien?`
3. Don't add unnecessary prefixes to function names, such as `get-`
   (this comes likely from the Java Bean standard and has no place here)
   or `compute-` (most functions compute something!). Use `digits` for fn that
   turns a number into a sequence of digits, `armstrong-num` for  fn that computes
   the [Armstrong Number](https://en.wikipedia.org/wiki/Narcissistic_number), and
   `armstrong?` for fn that tells you whether a number is an Armstrong number.

### From the unofficial Clojure style guide

Follow these recommendations:

1. [-> Instead Of To](https://guide.clojure.style/#arrow-instead-of-to)
2. [Optional Commas In Map Literals](https://guide.clojure.style/#opt-commas-in-map-literals)
3. [Gather Trailing Parentheses](https://guide.clojure.style/#gather-trailing-parens)
4. [Empty Lines Between Top Level Forms](https://guide.clojure.style/#empty-lines-between-top-level-forms)
5. [Don’t shadow clojure.core names with local bindings](https://guide.clojure.style/#dont-shadow-clojure-core)
6. [Use the threading macro ->>](https://guide.clojure.style/#threading-macros) to make the code more readable.

## Namespace declaration

Use `(ns ... (:require ...))` instead of `(require ...)` or `(use ...)`. Only exceptionally do `:refer :all`
and only use `:refer [..]` for frequently used symbols, i.e. prefer using an alias (e.g. `[clojure.set :as set]`)
- typically the last part of the namespace name or a well-established abbreviation.

(`require` is intended for use in the REPL, not in namespace files.)

See [Stuart’s Opinionated Style Guide for Clojure Namespace Declarations](https://stuartsierra.com/2016/clojure-how-to-ns.html) for more recommendations.

## State

##### Use `let` instead of `def` for local state

`def` & friends should only ever be used as a top level form (barring few exceptions such as `comment` and troubleshooting during REPL-driven development). Even if you use them inside a function, they still create globally visible Vars. Use `let` for local state inside a function.

## Functions

##### Use `recur` for recursive calls to avoid blowing the stack

Clojure lacks (for good reasons and due to JVM limitations) automatic tail-call optimization (TCO) and therefore calling a function from its body runs into the risk of `StackOverflowError` when recursing too many times. Use `recur` (perhaps together  with `loop`) to explicitly mark the call for TCO and avoid the risk.

See the ["Loop recur" ClojureBridge article](https://clojurebridge.org/community-docs/docs/clojure/recur/) for details.

##### Prefer higher-level sequence functions over low-level recursion

We rarely use recursion directly in Clojure because we can often achieve the desired result on a higher level by leveraging existing sequence functions, often `reduce`. (That themselves are implemented with recursion.) It makes for a clearer code.

```clojure
(defn exp [x n]
  (loop [res 1, pow n]
    (case pow
      0 1
      1 res
      (recur
        (* res x)
        (dec pow)))))
;; =>
(defn exp [x n] (reduce * (repeat n x)))
```

##### Prefer `=` over `==`

In Clojure it is most common to use just `=` for equality comparison. Only use [`==`](https://clojuredocs.org/clojure.core/==) if you really need it. Even if you come from JavaScript :-).

An example when this might be useful is when comparing a BigDecimal and a constant to avoid the need to manually wrap the constant with `(bigec)` (Clojure will do it for you).

## Trivialities

##### Too much code on a single line

Don't be afraid to split a line for readability, to visually separate individual
important arguments. Otherwise it might be difficult to spot the
individual arguments in the flood of the text. Ex.:

```clojure
(reduce (fn [a b] (+ a (exp b (first res)))) 0 (rest res)))
;; =>
(reduce
  (fn [a b] (+ a (exp b (first res))))
  0
  (rest res)))
```

##### Overusing "private"

If you come from Java, you are used to making everything private. In Clojure we  use `defn-` and `^private` sometimes but much less than in Java. Clojure targets trustworthy developers and allows them to shoot themselves into their foot if they really want to. Think about who do you want to protect from what with the privacy setting and whether it is necessary - especially if the function is essentially generic data transformation function. It is common to keep  functions that are implementation details subject to change at any time and without notice into a separate `*.impl.*` namespace to mark them clearly as such and keep them public.

## Additional resources

* Check out Stuart Sierra's [Clojure Do's and Don’ts](https://stuartsierra.com/tag/dos-and-donts)
* Read the unofficial [Clojure style guide](https://guide.clojure.style/)
