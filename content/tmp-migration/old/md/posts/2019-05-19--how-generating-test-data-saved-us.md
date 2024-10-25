---
title: "How generating test data saved us from angry customers and legal trouble"
category: "SW development"
tags: [clojure, testing, experience]
---

> _Me_: Simple! First we sum all the raw charges. Then we sum the totals over all categories - the two should be equal.
> <br>_Computer_: ... Nope!
> <br>_Me_: What?! Let me see... Are you telling me that `-0.01 + -0.05` is different from `-0.06`?!
> <br>_Computer_: Yep!

That's how I learned (again) to never use doubles for monetary amounts. I would never have thought of it myself (though I should have), hadn't we used generative testing to produce random test data (popular troublemakers included) - data I wouldn't have thought of, such as 0.01 + 0.05 that cannot be represented precisely with a double. Now that we switched safely over to BigDecimals and angry customers and law suits are off the table, you might wonder what is this generative testing about and how does it work.

Instead of hardcoding inputs and expected outputs, as in the traditional "example-based" testing, inputs are randomly generated and outputs are checked against rules ("properties") that you define, such as "the output of `(sort list)` should have the same elements and length as `list`; also, each element is >= its predecessor". And you can generate as many inputs as you want, for instance 100 is a popular choice.

<!--more-->

It requires more thinking but the tests cover much more of the domain of possible values. And it may pay off to think more about legal values and possible problems. With Clojure Spec - which we use - you can selectively override data generators for parts of the (nested) input data structure and thus test more special cases.

There are property-based/generative testing libraries for many languages - the original QuickCheck, its Erlang successor, Clojure's test.check, [ScalaTest](http://www.scalatest.org/user_guide/property_based_testing), couple [JS libraries](https://medium.com/javascript-inside/generative-testing-in-javascript-f91432247c27), .... They are not equally mature so check yours carefully.

### Learn more:

* [Jason Steinhauser: Intro to Property-Based Testing](https://dev.to/jdsteinhauser/intro-to-property-based-testing-2cj8)
* [Eric Normand: Testing Stateful and Concurrent Systems Using test.check](https://lispcast.com/testing-stateful-and-concurrent-systems-using-test-check/) - Great - perhaps the best - introduction into generative testing with some common challenges and solutions. It takes a simple yet practical and non-trivial example (key-value store), starts with the traditional example-based tests, then replaces them with generative tests asserting invariants, then moves up a level to generate random sequence of actions and check them using a simple model of the system. Later it delves into some common needs and solution (increase likelihood of collisions, concurrency testing, …).
* [John Hughes: Testing the Hard Stuff and Staying Sane](https://www.youtube.com/watch?v=zi0rHwfiX1Q) (video) - the key figure of generative / property-based testing talks about applying it to more challenging tasks
* [A Deep Specification for Dropbox](https://www.youtube.com/watch?v=Y2jQe8DFzUM) (video) - "Benjamin Pierce presented [research](https://pdfs.semanticscholar.org/4e36/b0f24f50c735da007af53090c723a737a298.pdf) he did to generatively test Dropbox. But before he gets into that, he surveys the field of formal specification in general, and how Generative Testing can be used to exercise a formal specification." (via [E.Normand](https://purelyfunctional.tv/issues/purelyfunctional-tv-newsletter-215-clojure-and-generative-testing/))
