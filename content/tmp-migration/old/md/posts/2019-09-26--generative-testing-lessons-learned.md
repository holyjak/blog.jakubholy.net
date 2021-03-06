---
title: "Applying Spec-based generative testing to a transformation pipeline - tips and lessons learned"
category: "SW development"
tags: [clojure, testing, experience]
---

Having the computer generate tests for you, trying tens of devious inputs you would never have thought of, is awesome. There is however far less experience with and knowledge of generative (a.k.a property-based) testing so I would like to share what we have learned and what worked for us when testing an important data transformation pipeline. We mostly leveraged our existing [Clojure Spec](https://clojure.org/guides/spec) data specifications to generate the tests, while regularly reaching down to [clojure.test.check](https://clojure.org/guides/test_check_beginner) to create custom generators and for low-level control.

<!--more-->

(If you are new to generative testing, the ["Learn more" section of How generating test data saved us from angry customers and legal trouble](/how-generating-test-data-saved-us#learn-more) points to a few great texts and talks. You should also check out the [Instrumentation and Testing in the Spec guide](https://clojure.org/guides/spec#_instrumentation_and_testing). Eric Normand's in-depth course [Property-Based Testing with test.check](https://purelyfunctional.tv/courses/property-based-testing-with-test-check/) could also be interesting.)

(For the time-deprived: [read the summary](#summary) first :-).)

## Introducing the problem

The code we needed to test processes company invoices for mobile phone usage and generates a summary and paid-by-user vs. paid-by-company for each phone number.

For the interested, the core of the computation is below (feel free to skip it).

```clojure
(ds/defn compute-org-usage :- ::kd/subscrs+profile-usages
  "Turn company invoices into a summary of each subscriber's usage in defined categories"
  [logger
   org :- :compute-org-usage/org
   feature-mappings :- ::kd/feature-mappings
   account-invoices :- ::kd/account-invoices]
  (let [account+invoices (vals account-invoices)
        inv-period (invoicing-period account+invoices)]
    (->> account+invoices
         (mapcat account+invoice->subscr-charge-batches) ; -> batches of charges, 1/subscriber-in-account
         (subscr-charge-batches->org-usage logger org feature-mappings inv-period))))

(ds/defn subscr-charge-batches->org-usage :- ::kd/subscrs+profile-usages
 "Compute org usage from the given subscriber charge batches."
 [logger
  org :- :compute-org-usage/org
  feature-mappings :- ::kd/feature-mappings
  inv-period :- ::kd/invoicing-period
  subscr-charge-batches :- ::kd/subsc-charge-batches]
 (let [inactive-subscribers (::kd/inactive-subscribers org)]
   (->> subscr-charge-batches
        (filter-ksd-subscribers logger (:settings/sid->ksd-profile org))
        (map #(categorize-summarize-subscr-charges logger feature-mappings %))
        (apply merge-with merge-subscr-switching-accounts)
        (filter-tlf-in-use logger inactive-subscribers)
        (leasing/add-leasing-usage-all logger (:leasing/leased-devices org) inv-period)
        (apply-profile-compute-totals org))))
```

## Solutions and best practices we discovered

### Combine example-based and generative tests

Generative tests are awesome but concrete cases of interest are easier to test with traditional example-based tests. Combine both kinds as appropriate. It is challenging to define the "properties" that generative tests check and they are necessarily somewhat general. They are good at checking many random inputs at a higher level. Compliment them with very concrete, example-based test(s) to verify the transformation in more detail and to test known, important corner cases that might not get generated. (Also, testing the same thing in two widely different ways gives us much more confidence that it really works.)

(We still generate random inputs in our example-based tests and then override the parts relevant to the test. That way there is less to hardcode, we test more, and there is less need to change the test as the shape of the input data evolves.)

For example `apply-profile-compute-totals` is responsible for summing up person's usage into the 4 or 8 categories based on whether she has the basic or standard profile, applying the company's limits on these categories and thus deriving how much of the costs should be paid by the user herself. The generative test checks the following properties:

* The input and output contain the same number of people
* The output has one entry per person
* The correct profile has been applied
* Sum of input usage charges = sum of output charges across all categories = the total computed for that user

The last property simplifies the input and output data (by adding them up and by not caring about individual categories while doing so) and then verifies that an important invariant holds (in this case, the amount of money coming in and out is the same). This is something we have used a lot as writing checks at a lower level would essentially require replicating the business logic in the test. But it doesn't guarantee that the charges have been properly assigned to their respective categories and the correct relationship between charges, limits, and how much should be paid by the user vs. the company. Therefore we have also example-based tests for selected cases that check all the amounts (usage-over-limit, usage both including and excluding VAT, total-usage) in every category, as you can see below (you don't need to understand anything beyond the fact that we check very concrete cases and individual data; BTW this is the most extensive example-based test in our codebase):

* Basic profile where deductible-min is 0 and all limits are 0 (i.e. the company pays nothing)
* Basic profile where all limits are "unlimited" and thus usage-over-limit should be 0
* Basic profile with deactivated leasing and thus the leasing category shouldn't be there
* Usage over limit is only charged if greater than the deductible-minimum
* Standard profile, limit 10k => no 'all usage' but individual categories, 0 < usage over limit < usage

###  Combine different "unit" sizes

Ideally we would test the whole transformation pipeline. But it turned out to be more effective to test individual stages of the data transformation pipeline and only have a light "smoke test" for the whole pipeline.

We apply the [Functional Core, Imperative Shell](https://blog.jakubholy.net/design-in-java-vs-fp/) architecture and thus the top-level function takes in all the data necessary for the transformation, lot of it irrelevant for most stages. When we test an individual transformation stage, we only generate the subset of the data it needs, which will be faster and we will be able to run more tests in the same time span. The tests will also be more relevant to the function, we won't be wasting cycles on varying data it doesn't care about. Moreover it is much easier to tune the data to test the most important parts of the data space / avoid problematic ones.

For example many of the stages operate on a single user's charges and it is thus much more efficient to focus on generating different sets of single-user charges than a number of different users, many with similar sets or charges. (Remember, the computer doesn't know that it makes no difference to your program whether a particular set of charges belongs to the user "Sokrates" or "Buddha" so it might well try it with both.)

(Note: We have Spec-ed the most important arguments of the most important functions throughout the code and not just at the boundary of the system because we don't care only about validating the data as it enters our system but also use it to document the shapes of the data flowing through for future maintainers / ourselves. Thus we can easily get test generation for these lower-level functions.)

### Tune input data to focus on the most important parts of the problem domain

Generative testing is dumb, it does not understand your data, it doesn't know that variations in some parts of it are more interesting than others and that some variations are completely irrelevant for the test. For example we need user names but we don't care what they are, we just pass them through so running the same test once with "John Doe" and once will "a#!" is useless. It also only matters to us whether "charge date" is before or after "invoice date" - how many days off it is makes no difference. The data space is huge (there is infinite number of "names" and dates) so we need to help the computer focus on the parts that are most interesting. Often we don't care much about "variations in data" (though it is often beneficial to try different troublesome data, such as nil, "", very large numbers, floats that cannot be added exactly, etc), what we typically care about is "variations in relationships." For example two charges belonging to the same user and category (so that we have to sum them up) or a charge with a type that is not among the known types.

You want to:

* Avoid unnecessary variations that don't influence the results to avoid waisting test cycles
* Ensure data collisions - limit the input data so that interesting relationships pop up, such as the same user on multiple charges
* Focus on the "happy path" - mostly you want to test that your transformation logic is correct and not run into your data validity checks all the time (unknown user, missing user profile, illegal charge type, ...) (It might still be useful to test error handling but it is often better served through dedicated tests.)

#### Solution

##### Custom generator unique to a test

When you run `clojure.spec.test/check` it allows you to provide generator overrides. I often use `sg/return` to return a hardcoded value or a generator returning a particular subset of possible values (e.g. `(s/gen <a set>)`).

Example:

```clojure
(require '[clojure.spec.alpha :as s] '[clojure.spec.gen.alpha :as sg]
         '[clojure.test.check.generators :as gen])
(def feature-mappings {...})
(check `categorize-summarize-subscr-charges-wrapper
 {:gen       {;; Ensure featureCodes that are in feature-mappings used so that the transformation doesn't error:
              ::kd/feature-mappings (constantly (sg/return feature-mappings))
              :cbm/featureCode      (constantly (s/gen (into #{} (keys feature-mappings))))
              ;; The fn requires that all the charges passed to it are for the same subscriber, so hardcode one:
              ::kd/sid              (constantly (sg/return "4790909090"))
              ;; Exclude advance (future) payments so that biz-rules do not kick in, potentially throwing an error:
              ::kd/future?          false}})
```

##### Spec a wrapper function that merges several inputs so that you can ensure relationships between them

Sometimes two inputs depend on each other but you still want to generate them randomly (contrary to the hardcoded `feature-mappings` above.) The solution is to define and spec a wrapper function that takes a single argument
and provide a spec and a generator for it (the generator will typically leverage `gen/let` or `sg/fmap`
to derive one input from the other). Example:

```clojure
;; A function taking two related maps:
(defn f [a b] ...)
;; Wrapper, taking a single input - tuple of a and b:
(defn f-wrapper [[a b]] (f a b))

;; Spec for the ab tuple with a generator that ensures
;; that the generated `b` has an entry for each key of `a`
(s/def ::ab
  (s/with-gen
    (s/tuple ::a ::b) ;; a, b specs defined elsewhere
    #(gen/let
      [a         (s/gen ::a)
       b-entries (sg/vector (s/gen ::b-entry) (count a))]
      [a
       (zipmap (keys a) b-entries)])))
(s/fdef f-wrapper
  :arg (s/cat :ab ::ab))
```

### Tips for testing the :fn specification (relations between inputs and outputs)

`s/fdef` allows you to specify the input and output specs but also the "properties" that should hold between the inputs and outputs via the `:fn` spec. We found it best to use named functions as the predicates:

```clojure
{:fn (s/and
      (fn keeps-all-subscribers? [{:keys [args ret]}] ...)
      (fn one+usage-per-subscr? [in] ...)
      (fn correct-profile-applied? [in] ...)
      (fn same-charge-sum-and-totals-relevant-cats? [in] ...)}
```

because it makes both failures and the intent of the predicate easier to understand.

If a predicate function fails, the inputs are included in the error message as `:args` and `:ret` under `(-> check-result first :clojure.spec.test.check/ret :shrunk :result-data :clojure.test.check.properties/error :data :clojure.spec.test.alpha/val)`. Alternatively, just use `def` inside the failing predicate function to capture the inputs.

### Tooling: Store the error, print the most relevant parts of it

What if a test fails? You likely don't want to print the whole error that contains a lot of text and the whole input. You want to see the relevant parts of it - and you want to have the whole (shrunk) input available so that you can re-run and troubleshoot the function manually.

We do

1. Extract the check result (see `check-ret` below)
2. Store it into an atom called `last-error` so that it is easily accessible from the REPL
3. Extract and print the `:seed` from it so that we can rerun the test with the same seed and thus same "random" data
4. We send the full results to `tap>` so that we can inspect it with e.g. REBL
5. We use `expound/explain-results` to get human-friendly error messages (while still having access to the full result via `@last-error`)

Here are some useful subsets of the captured Spec error:

```clojure
;; the smallest failing inputs
(-> @last-error :clojure.spec.test.check/ret :shrunk :smallest)
;; Spec failure details with the shrunk input -> :clojure.spec.alpha/value, /problems etc.
(-> @last-error :shrunk :result-data :clojure.test.check.properties/error :data)
;; for rerunning the test with the same 'random' data
(-> @last-error :clojure.spec.test.check/ret :seed)
;; the error message itself
(-> @last-error :failure (.getMessage))
;; key parts of the spec err (the failed predicate, where in the input the bad data was, its value):
(-> @last-error :failure ex-data :clojure.spec.alpha/problems first (select-keys [:path :val :pred]))
;; (sometimes) the fn whose spec failed
(-> @last-error :failure ex-data :clojure.spec.alpha/fn)
;; (sometimes) the args of the fn whose spec failed:
(-> @last-error :failure ex-data :clojure.spec.test.alpha/args)
;; the failed value (for :fn spec this is a map with :args, :ret):
(-> @last-error :failure ex-data :clojure.spec.alpha/value)
```

Here is our setup code and `check` enhanced with failure capturing and presentation:

```clojure
;; Ensure we don't print too large data in the REPL
(alter-var-root #'*print-level* (constantly 8))
(alter-var-root #'*print-length* (constantly 10))

(defn check "Use in deftest with (is (true? (check ...)))"
  [sym opts]
  (let [check-results (st/check sym opts)
        check-result (first check-results) ; we only get 1 for we only pass 1 sym to st/check
        check-ret (-> check-result
                      :clojure.spec.test.check/ret)
        result (:result check-ret)
        seed (:seed check-ret)
        failure (:failure check-result)
        spec-fail? (-> failure ex-data ::s/problems)]
    (when-not (:pass? check-ret)
      (reset! last-error check-result)
      (tap> check-results)
      (println "### Test failure (seed" seed "; stored into @last-error, sent to tap>)")
      #_(pprint (let [fail (-> check-results first :failure)]
                  (or (-> fail ex-data ::s/problems) fail)))
      (if (seq check-results)
        (binding [s/*explain-out* expound/printer]
          (expound/explain-results check-results))
        (println "WARN: No results from `st/check` - perhaps" sym "has no fdef / couldn't be resolved?")))
    result))
```

### Performance: Adjust the number of generated tests and size of data

Performance is a challenge for generative testing for a number of reasons:

* You are running tens of tests (the default for `st/check` is 100) so if your functions aren't lightning fast, you will feel it
* Generating large data takes time (and processing large data also takes more time)
* Shrinking of large data can take lot of time

Therefore you might want to limit the number of tests (which also limits the data generation time since the more tests, the larger / more complicated data is generated [well, not exactly, but...]). Perhaps you want to have quicker tests with fewer test cases while developing but run many more on the CI server. To set the number of tests:

```clojure
(st/check <function> {:clojure.spec.test.check/opts {:num-tests 30, ...}})
```

Similarly, you can limit the size of the generated data, primarily the length of collections (*BEWARE: This did nothing for me and I have to explore why*):

```clojure
(st/check <function> {:clojure.spec.test.check/opts {:max-size 3, ...}})
```

### Troubleshooting and tuning performance

Another reason for slowness is that generating test data that is valid may take time - and fail. The way this works is that there are base generators and ways to combine them and - most importantly here - ways to limit them. For example you want a string - but one that has 5 - 10 characters and contains only consonants. Test.check will generate a number of completely random strings and filter out those that do not satisfy these conditions (via its `such-that`). In this case it is likely to fail to generate any/many valid strings. Here is an example of such a failure:

> ExceptionInfo: Couldn't satisfy such-that predicate after 100 tries. {:pred #object[clojure.spec.alpha$gensub$fn__1876 0x3a0dfc51 "clojure.spec.alpha$gensub$fn__1876@3a0dfc51"], :gen #clojure.test.check.generators.Generator{:gen #object[clojure.test.check.generators$gen_fmap$fn__14242 0x2ef1f55e "clojure.test.check.generators$gen_fmap$fn__14242@2ef1f55e"]}, :max-tries 100}
> (As you can see, it is quite useless, as it does not point to the failed spec.)

You are better off providing a custom generator that only generates valid data (e.g. select randomly from the set of consonants -> take randomly 5-10). However the problem - in my experience - is finding the spec that is causing the problem. Even if test-check fails to generate valid data, the error (as of now) does not contain any details useful in pinpointing the problematic spec (see [CLJ-2097](https://clojure.atlassian.net/browse/CLJ-2097) and [a workaround](https://gist.github.com/holyjak/8cadc0d939c8e637ef6bf75b070d28b4)). And if it doesn't fail, you just see that _something_ is slow. Even a small, innocent-looking change to a spec may occasionally result in a noticeable slowdown. I wish I had a good troubleshooting recipe but I don't. What worked for me to some extent is the classical divide-and-conquer approach: ask `sg/sample` to generate many samples (remember - the more _different_ samples, the harder it has to work and the more likely is it to run into unsatisfiable `such-that` constraints) and, when I get a failure, repeat the process on the sub-specs of the failed spec (i.e. individual keys of an `s/keys` spec....) to see which one is causing it. I wish generators were linked to the specs and there was a way to enable time tracking that would give you a list of the slowest generators (per invocation / in total)....

### Enable spec checking also for functions used by the function under test

`st/check` only checks the function you give to it. But you likely want to both discover if there is something wrong when invoking a helper function and possibly get an error that is closer to the source. Therefore enable spec checking for all functions invoked during the test:

```
;; Ensure we check spec-conformance for all fns called during testing
(st/instrument)
```

#### Consider using respeced to check also the `:ret` specs

Contrary to `st/check`, `st/instrument` will only check that functions inputs match the specs, it will not check the outputs. If you want that, use [respeced](https://github.com/borkdude/respeced).

## Summary

Generative testing is very useful and powerful but you need to know how to keep its performance under control and how to interpret failures. Some of the things it helped us discover were holes in our spec (forgetting about the possibility of a `nil` input, ...), that computations with doubles are not exact and we should use `decimal` instead, many small and bigger bugs. The things we struggled most with were pinpointing the source a failure, speed, coming up with good, simple, yet valuable "properties" to check. These are our lessons learned:

* Combine example-based and generative tests
* Combine different "unit" sizes
* Tune input data to focus on the most important parts of the problem domain
* Used named functions as predicates in :fn specs
* Tooling: Store the error, print the most relevant parts of it
* Performance: Adjust the number of generated tests and size of data
* Troubleshooting and tuning performance
* Enable spec checking also for functions used by the function under test
