---
title: "Defeating Legacy Code with Living Documentation And Business-Level Tests"
category: "SW development"
tags: [clojure, testing]
---

The big struggle when entering a new code base is distinguishing the essential business logic from the incidental aspect of how it is implemented. Both are just code - but which parts must be there and the way they are and which can be changed? If you don't know then you fear to change anything. And that is exactly what happened when we took over the application MB. What to do? How to save the code from becoming an incomprehensible mess of legacy code, and dying?! We found an answer:  [clj-concordion](clj-conc). (Read: Functional Core, Imperative Shell and Specification by Example.) 

<!--more-->

## Aside: Why do we fear legacy code?

There are many definitions of legacy code but the one I like is:

> Legacy code is the code you fear to change because of possible unintended consequences.

In other words it is the code you don't understand enough to change ± safely. Often it is because there are unobvious relations, perhaps between seemingly remote parts of the code. But the problem persists even in a well-designed codebase. The source of this hindering lack of knowledge is that you can see _how_ the code does its thing - but you can only guess at _what_ is it it tries to accomplish and _why_ it does it. As written above, you struggle distinguishing the essential and incidental in the code.

If you fear the code then you try to make each change as nonintrusive as possible. You work around the existing code, you wrap it, you place the change there where it is least likely to disturb the existing flow - instead of refactoring the code to keep up to date with the evolving needs and making your changes where it would be best. The result is that complexity increases even more and eventually goes through the roof. With it, maintenance costs and frustration. I call this the _the spiral of (legacy) death_:

Lack of understanding ➡ Fear ➡ Workarounds & hacks ➡ More complexity ➡ More fragile and harder to understand ➡ (repeat...) ➡ 💥

## Testability via Functional Core, Imperative Shell

A big problem with MB was that it wasn't testable because side-effects (reading / writing the DB, reading from REST) were spread throughout the graph of cooperating objects. The solution was to apply the [Functional Core, Imperative Shell](https://blog.jakubholy.net/design-in-java-vs-fp/#the-clojure-solution) architecture: the 90% "functional core" consists of pure (side-effect free) functions that take the necessary data as arguments and produce a "description" of the desired effects (example: `{:email {:to .., :body ..}, :db {:insert {...}}}`) and the "imperative shell" first collects the data needed by the core and then applies the effects: shell (data retrieval) → core (processing) → shell (effect application). This approach is a perfect fit for Clojure, which is a data-oriented and functional language. Data transformations (and preferably pure functions) are its bread and butter.

We can test the whole with one or few simple integration tests (the imperative shell is tiny and should do as little as possible and thus in need of only little testing) and focus all testing of the business logic on the functional core, which is as simple as calling pure functions and checking their results. In our particular case the functional core itself is a pipeline:

```clojure
(-> data
    preprocess
    step1
    step2
    ...
    data->effects)
```

We can choose how much of the pipeline we want to exercise in each test. In most our business tests we run it whole except the `data->effects` transformation (as the data is easier to verify) but in a few cases we skip `preprocess` and send in data in the simpler internal format, as it is easier to set it up. We leverage Clojure Spec to generate random, valid inputs and override parts of it based on the requirements of the test. (We also test smaller chunks with technical unit tests, focusing on the correctness of the transformations and corner cases. You can read more about those in [Applying Spec-based generative testing to a transformation pipeline - tips and lessons learned](2019-09-26--generative-testing-lessons-learned).)

The result is that our tester is overjoyed. No longer does he need to spend hours looking for / doctoring data, uploading XMLs to other services, and getting frustrated when it still doesn't work. Instead, he writes a table of input data and the expected outcome and goes happily about other tasks.

## Insight via the living documentation of Specification by Example

I proposed that a major problem for code maintenance and longevity (next to complexity) is the inability to distinguish the essential and incidental aspects of code. Ideally, our programming languages would be on such a high level that we could express the business concerns directly, without any clouding incidental details. But we aren't there yet. A solution that worked for us was to make explicit the essential aspect and the surrounding context necessary for proper understanding. Specification by Example (SbE) is a tool just for that. So what is it? [From Wikipedia][sbe-wiki] (emphasis mine):

> Specification by example is a *collaborative* approach to defining requirements and *business-oriented functional tests* for software products based on capturing and illustrating requirements using *realistic examples* instead of abstract statements. [...] particularly successful for [..] projects of significant domain and organisational complexity.

(You can read more in Gojko Adzic's great and captivating book [Specification by example - How successful teams deliver the _right_ software][sbe-book]. Highly recommended for anyone who deals with requirements or testing, whether you consider applying SbE or not.)

Practically speaking, developers, testers, and business<!--](*TODO:3 amigos*)--> write together a business-level _specification_ of the context, logic, and rules and accompany each with a few _key examples_ that both concretize the discussion and clarify corner cases. Most importantly, the examples are _executable_ - the specification document (a [.md][cc-md] in our case) is [_instrumented_][cc-instr] so that data from the examples can be extracted and fed into the underlying test code. The results (expected vs. actual values) are displayed inline in the specification so you can see at once that it really matches what the code does. This is crucial - it makes the specification into "living documentation" that cannot get out of sync with what the code actually does (contrary to any other documentation) because tests would start failing and you wouldn't be able to deploy the out-of-sync code. The specifications are next to the code and are version-controlled together with it so it is easy to find and access and you can access historical versions. And you can automatically export the rendered documentation with inline results for easy access by the business.

Aside of the particular business rules, an equally - if not more - important part of the specifications is explaining the wider context, the "why". Reading the documentation should convey sufficient understanding of the problem domain, its concerns and constraints, its terminology - so that you can actually talk to the business in their language and understand and re-negotiate the concrete business rules as needs evolve.

Other than ensuring that the application really does what it should, the specifications are also used when discussing the problem domain and needs with the business and they are the entry point for any new team member.

Concordion has a [nice, concise introduction to SbE][cc], the ThoughtWorks blog has a good [example of Specification by example](https://www.thoughtworks.com/insights/blog/specification-example), and you can also check out [SbE on Wikipedia][sbe-wiki] and the aforementioned [SbE book][sbe-book]. You can also use your search skills to learn about the wider domain of Behavior-driven development (BDD).

## Concordion and Java vs. clj-concordion

The tool for instrumenting and verifying specifications that we picked is [Concordion][cc], an extensible Java, .NET (and Clojure) testing library. What we liked about it is simplicity - there is very little "logic" you can have in your specifications other than calling custom functions with data from the text/tables and asserting that a function returns true/false/value matching a text. It is not ideal but it is quite good. (I'd highly recommend its [Hints and tips][cc-tips] page that also explains why you want to keep your specifications and the code directly underneath them simple and business-focused.)

We could have used Concordion's Java library and write (thin) JUnit specification "fixtures" delegating all work to Clojure. However we preferred not to deal with two languages and two testing libraries/runners and wanted a direct connection between the Markdown specifications and our Clojure code. Thus I have created [clj-concordion][clj-conc], a Clojure extension of the Concordion Java library. It eventually evolved to offer some useful additional functionality, and we are pretty happy with using it.

The main difference from the Java support is that the expression syntax isn't OGNL but is mostly a limited subset of EDN (which could  easily be extended but we prefer to keep it small and simple in accord with Concordion's philosophy) - it can contain number, boolean, and string literals, vectors, nils, optional commas, and keywords (used mostly for named, optional arguments) in addition to Concordion "variables" and the actual function calls (written in the Java-way of `fnName(args...)`). (You can also choose to forego these improvements and write in a Concordion-compatible way.) Data from tables is automatically trimmed to remove extraneous trailing whitespaces that Concordion (2.2) includes and you can ask for the tests to stop at the first test failure (in addition to an exception) so that you could look at the state in your REPL.

<!--**TODO: Other BDD tools?** Fitness? -->

## Example

It would be a great negligence to talk about Specification by Example without providing an example, so here you go!

### Specification & instrumentation

A Concordion specification document is a Markdown file using the titles of dummy links to connect the text with the code:

---

```markdown
<!-- File specifications/charges/SubscriptionCharges.md: -->
Subscription charges
====================

Subscription charges are charges and discounts pertaining
to the subscription itself.

## Clasification of charges as subscription charges

A charge is a subscription charge when

1. either it has the service type _P_ (as "priceplan"), charge type
_R_ (as "Recurring"), and is in the group "Faste avgifter"
2. or it is in the group "Rabatter" and has the same `featureCategory` as an existing subscription charge
   (that is how the CRM indicates a discount on a subscription, in some cases)

### Examples

#### [1. Various ordinary subscription and non-subscription charges](-)

Given these charges in the "[Faste avgifter][grp]" group:

| [ ][chSCh] [Service type][srv] | [Charge type][cht] | featureCategory | [Subscription charge?][isSt] | Description         |
|:------------------------------ |:------------------ |:--------------- |:---------------------------- |:------------------- |
| P                              | R                  | GS11            | yes                          | Subscription Medium |
| G                              | O                  | OT37            | no                           | Phone monthly cost  |
| R                              | R                  | X               | no                           | Mobilstatus         |

[chSCh]: - "#result = isSubscriptionCharge(#srv, #cht, #grp)"
[isSt]: - "?=#result"

[grp]: - "#grp"
[srv]: - "#srv"
[cht]: - "#cht"
```

Here, the link `[R](- "#cht")` sets the "variable" `cht` to "R", `#result = isSubscriptionCharge(#srv, #cht, #grp)` calls the function `isSubscriptionCharge` with the given arguments and stores its output into a variable, while `[yes](- "?=#result")` asserts that `result` is `true`. (Concordion supports yes/no as aliases to true/false.) The magical links added to the header cells of the table are actually applied sequentially to each row.

Running tests would render this specification approximately like this (adjusting header sizes for readability):

##### Subscription charges

Subscription charges are charges and discounts pertaining to the
subscription itself.

###### Clasification of charges as subscription charges

A charge is a subscription charge when

1. either it has the service type _P_ (as "priceplan"), charge type
_R_ (as "Recurring"), and is in the group "Faste avgifter"
2. or it is in the group "Rabatter" and has the same `featureCategory`
  as an existing subscription charge (that is how the CRM indicates a
    discount on a subscription, in some cases)

**Examples**

_1. Various ordinary subscription and non-subscription charges_

Given these charges in the "Faste avgifter" group:

| Service type | Charge type | featureCategory | Subscription charge?                                               | Description         |
|:------------ |:----------- |:--------------- |:------------------------------------------------------------------ |:------------------- |
| P            | R           | GS11            | <span style="background: lime">yes</span>                          | Subscription Medium |
| G            | O           | OT37            | <span style="background: lime">no</span>                           | Phone monthly cost  |
| R            | R           | X               | <span style="background: red"><del>no</del> <ins>true</ins></span> | Mobilstatus         |

---

Notice that the instrumentation links have been removed and test results show inline.

### Test code

We need to expose the function `isSubscriptionCharge` to the specification. We do that in a test namespace derived from the path of the specification's parent folder by adding a `deffixture` matching the specification file name:

```clojure
(ns specifications.charges-test
  (:require
    [clojure.test :refer :all]
    [app.core :as app]
    [clj-concordion.core :as cc :refer [deffixture]]))

(deffixture SubscriptionCharges ; [1]
  {:cc/after-example (fn reset-state [_] (println "> Hi from after ex.!"))})

(defn isSubscriptionCharge [service-type charge-type group]; [2]
  (boolean
    (app/subscr-charge?
      {:service-type service-type, :charge-type charge-type, :group group})))

;; Ensure Concordion is reset between each run (when running repeatedly via REPL)
(use-fixtures :once cc/cljtest-reset-concordion); [3]
```

We need very little:

1. `deffixture` with the same name as the specification file in a namespace  with the same relative file path (only appending `-test` to the last segment). We pass it a possibly empty map of options - here we just define a dummy after-example hook.
2. We define the functions used by the specification. Every argument is a String and it has to return a String or a boolean.
3. We ensure that Concordion's cached results are reset after each test run so that we can run them anew repeatedly from the REPL.

### Output

When we run the tests, we will see something like this:

```
$ lein test
file:///var/folders/kg/r_8ytg7x521cvlmz_47t2rgc0000gn/T/specifications/
charges/SubscriptionCharges.html
Successes: 1, Failures: 0
> Hi from after ex.!
```

We can then open the rendered file with test results.

## Summary

A major cause of the "legacyfication" of code is, next to the lack of simplicity, the inability to distinguish the essential and incidental aspects of the code. While code communicates perfectly _how_ it works, you can only guess at _what_ it tries to achieve and _why_ it does so (and why in that particular way). If you have a complex business domain, a great way to visualize the essential aspects is to write business-level "specification documents" of the logic and rules and communicating the wider context and goals. The specifications include and are clarified by concrete, key examples, which are fed to automated tests and demonstrate inline that the code actually follows the specification. The specifications live with the code and the examples and tests (and some discipline) ensure that they remain "living documentation," always up to date. Not only do these specifications serve to verify that the application behaves as desired but they also provide a shared basis for discussions with the business and an invaluable trove of knowledge for new and forgetting team members.

To make high-level business-oriented tests possible, it helps to put all the business logic into a "functional core," that takes data in and returns other data - which is easy to examine - while side-effects (retrieving data from external sources, changing anything outside the application) are pushed to a thin "imperative shell" of code around it. Clojure is a perfect choice for such an approach (and Clojure Spec's data generation capabilities also help with testing). Concordion is a simple yet fully satisfactory tool for the task and [clj-concordion][clj-conc] makes it a pleasure to use with the business Clojure code.

[sbe-wiki]: https://en.wikipedia.org/wiki/Specification_by_example
[sbe-book]: https://gojko.net/books/specification-by-example/
[clj-conc]: https://cljdoc.org/d/clj-concordion/clj-concordion/CURRENT
[cc]: https://concordion.org/
[cc-md]: https://concordion.org/documenting/java/markdown/ "Concordion Markdown"
[cc-instr]: https://concordion.org/instrumenting/java/markdown/
[cc-code]: https://concordion.org/coding/java/markdown/
[cc-tips]: https://concordion.org/technique/java/markdown/
