---
title: "Solution design in Java/OOP vs. Clojure/FP - I/O anywhere or at the boundaries? - experience"
category: "SW development"
tags: [clojure, java, design, clojure-vs-java]
---

As a Clojure developer thrown into an "enterprise" Java/Spring/Groovy application, I have a unique opportunity to experience and think about the differences between functional (FP) and object-oriented programming (OOP) and approach to design. Today I want to compare how the solution would differ for a small subsystem responsible for checking for and progressing the process of fixing data discrepancies. The main question we will explore will be where do we deal with external effects, i.e. I/O.

<!--more-->

(_Published originally at the [Telia Engineering blog](https://engineering.telia.no/blog/design-in-java-vs-fp)._)

I see OOP as a graph of mutable and possibly side-effectful objects, while FP as a compositions of primarily pure, side-effect free functions. FP tends to push I/O and other (side-)effects to the edges of the system.
These are just "cultures" and you are free to create many different designs, aligned with them or not. Many even in the OOP world have noticed that spreading mutation and effects all around makes maintenance difficult. Still, the culture of the programming language leads you to think in certain ways and more likely to come up with some designs than others.

Let's look at the problem at hand and what would be the more "natural" way of solving it in Java/OOP and Clojure/FP.

### The problem

The problem to solve is the validation and correction of the billing cycle length of our customer organizations. The process is as follows:

1. Verify that all invoice centers within the organization have the same billing cycle length and use that as the organization cycle length; if any invoice centre differs, set the org cycle to "UNKNOWN"
2. If the cycle length has just changed from a valid value to UNKNOWN then notify the Customer Service to fix it and record that we have started fixing this org together with its previous, valid cycle length
3. If the current cycle length is UNKNOWN but we have already started fixing it, do nothing (or send a remainder to C.S. if it has been too long)
4. If the cycle length has just changed from UNKNOWN to a valid value (as a result of C.S. fixing the maverick cost centre) then record that it is fixed and proceed normally (but see 5.)
5. If the cycle length has changed to a valid value different from the previous valid value then notify C.S. that they need to check whether any cycle-level limits need to be adjusted and record that we need to await the result of the manual check

I won't go into all the cases here since we are not interested in the solution itself but rather in its "shape".

### The Java (well, actually Groovy) solution

Let's zoom in into the heart of the solution:

``` groovy
@Component // So that Spring will instantiate it and inject all
           //  @Autowired dependencies
class BillCycleFixer {
  Logger log = LoggerFactory.getLogger(getClass())
  @Autowired OrgRepository db
  @Autowired EmailService email
  @Autowired AppSettings settings

  void handle(Organisation org, BillingCycle currentCycle) {
    if (currentCycle == UNKNOWN && /*past:*/org.billingCycle != UNKNOWN) {
      return handleNewlyUnknown(org)
    } else if //...
    } else if //...
    // ..
    } else { .. }
  }
  void handleNewlyUnknown(org) {
    email.send(to: settings.getCsEmail(), subject: "Fix cycle for ${org.id}", body: "...")
    db.recordBillingCycleCorrectionTriggered(org)
    db.setBillingCycleForOrg(org, UNKNOWN)
    log.info("Started fixing cycle for ${org.id}")
  }
}
```

A typical Spring Bean with injected dependencies, fetching everything it needs and producing all the effects.

This is the big picture it fits into:

```
@Scheduled BillingJob ->
  OrganizationBillingProcessor(org) ->
  BillCycleFixer
```

### The Clojure solution

We could do the same as in Java but it feels wrong to have a function producing plenty of side effects (and no result), not mentioning how difficult is it to test. An interesting question thus arises: **How to separate pure business logic and the execution of effects, or how to make the core function pure** (i.e. just taking arguments and producing a result)? The result part is simple, we can take an inspiration from the frontend frameworks [re-frame](https://github.com/Day8/re-frame#it-is-a-6-domino-cascade) or [Redux](https://redux.js.org/) and just return a map of the desired effects, such as `{:email {:to .., :body ..}, :db {:insert {...}}}` that are later executed by registered _handlers_. But what about the additional data the function _might_ need from the database? For that I can now think of three solutions and there are surely more:

1. If the data is small, just fetch it eagerly all into the memory before invoking the pure function.
2. Similarly yet differently, provide the function with a lazy datastructure that only fetches the data when it is actually accessed (e.g. via [`delay`](https://conj.io/store/v0/org.clojure/clojure/latest/clj/clojure.core/delay/)). Thus the effect happens in the function but is transparent to it, it doesn't know or care whether the data already was there or not or how it was produced.
3. Follow more of Redux/re-frame, making the process multi-pass: when the function is invoked and lacks some data, it will produce an effect asking for it (for example `{:db/find {:table "xyz" :id 123}}`); the "framework" will process it and re-invoke it when the data becomes available.
4. (Thanks, Erik!) Split the logic into multiple steps based on the extra inputs needed, retrieving the data and applying the step logic (or not) based on the outcome of the previous step(s).

#### The core decision function

```clojure
(ns app.billing)
;; NOTE: ctx, i.e. context, contains e.g. the `AppSettings`
(defn handle-change [{:keys [ctx org-id current-cycle previous-cycle corrections-wip] :as args}]
  (cond
    (and (= current-cycle :UNKNOWN) (not= previous-cycle :UNKNOWN))
    (handle-newly-unknown {:org-id org-id, :previous-cycle previous-cycle})

    ;; case 2 existing-unknown, uses corrections-wip

    ;; case 3
    ;; ...

    :else (throw (ex-info "unexpected case") args)))

(defn handle-newly-unknown [{:keys [ctx org-id previous-cycle]}]
  ;; Return a map of desired effects:
  {:email {:to (get-in ctx [:settings :cs-email]), :body "...", :subject "..."}
   :db [[:insert :billing-cycle/correction-triggered {:org org}]
       [:update :org/billing-cycle {:org org, :billing-cycle :UNKNOWN}]]
   :log {:level :info, :id ::correction-triggered, :data {:org-id org-id}, :msg "Started fixing ..")})
```

Notes:

1. `corrections-wip` is the content of the `Billing_Cycle_Corrections` table (fetched eagerly or lazily as proposed in case nr. 1 or 2 above)
2. The log format comes from Frankie Sardo's very inspiring article [
Logging: change your mind – The ultimate guide on modern logging](https://juxt.pro/blog/posts/logging.html).

#### The surrounding system

This is a simplified code that demonstrates how we would invoke the `handle-change` defined above function, starting from `bill-cycle-cleanup-job`, fetching data, applying `handle-change`, handling effects:

```clojure
;; Job: fetch data, register handlers, exec fn for each org,
;; exec effects

(def handlers {:email handle-email, :db handle-db, :log handle-log})

(defn handle-email [ctx {:keys [to subject body]}]
  ;; This could be an ordinary function or something pre-initialized
  ;; and passed in via a Dependency Injection tool such as Integrant
  ;; or Mount
  (email/send ...))

;; Handle db operations
(defn handle-db [{:keys [db]} [op data-type params]]
  (case [op data-type]
    [:insert :billing-cycle/correction-triggered]
    (jdbc/insert! db :billing_cycle_corrections
                  {:organizationNumber (-> params :org :number), :billCycle (-> params :org :bill-cycle)})

    ;; case 2 ...
    ))

(defn handle-log [ctx log-map] ...)

;; For each effect, get and apply the corresponding handler
(defn handle-effects [eff-map]
  (doseq [[effect params] eff-map]
    (apply (get handlers effect) params))) ;; No error handling :-)

(defn bill-cycle-cleanup-org [ctx org org-cycle]
  (when (not= (:org bill-cycle) org-cycle)
    (handle-effects
      (handle-change {:ctx ctx, :previous-cycle org-cycle, :corrections-wip (:corrections-wip ctx), ...}))))

(defn bill-cycle-cleanup-job [ctx]
  (let [orgs (fetch-all-orgs ctx)
        org-cycles (map #(fetch-org-billing-cycle (:db ctx) %) orgs)
        corrections-wip (db/get-all :billing_cycle_corrections)]
    (map #(bill-cycle-cleanup-org
             (assoc ctx :corrections-wip corrections-wip) %1 %2)
         orgs
         org-cycles)))
```

#### Pros & Cons

Pros: The decision-making function is pure and trivial to test. I/O is mostly limited to specific, small parts of the program.

Cons: The "business logic" is now spread across multiple places, namely the place where we fetch and pass on the necessary data and the decision function that uses them. These two must be kept in sync, which is always a challenge.

#### Alternatives for passing data to the decision function - details

Above I proposed 4 approaches for passing data to the pure decision functions. I will now demonstrate them with examples. I will use `make-decision` to represent the pure, side-effect free function.

1. If the data is small, just fetch it eagerly all into the memory before invoking the pure function - trivial, we saw that above with `corrections-wip`.

2. Fetch the data lazily only when/if it is actually needed:

```clojure
(make-decision {:required-dataX (fetch-x!),
                :optional-dataY (delay (fetch-y!))})
;; Inside make-decision:
;; ...
(do-something-with @optional-dataY) ;; get the actual value
```

3. Redux/re-frame way - the logic function asks for more data if it needs it, by returning the effect `:fetch-more-data`:

```clojure
(loop [data (fetch-data!)]
    (let [effects (make-decision data)]
        (if-let [data-request (:fetch-more-data effects)]
            ; Run the loop again, with the additional data:
            (recur (merge data (fetch! data-request)))
            (apply-effects! effects))))
```

4. (Thanks, Erik!) Split the logic into multiple steps based on the extra inputs needed, go through them until one can make the final decision:

```clojure
(first
  (drop-while
    (fn [decision] (not (:done @decision)))
    [(delay (make-decision-part1 (fetch-part1-data!)))
     (delay (make-decision-part2 (fetch-part2-data!)))
     (delay (make-decision-part3 (fetch-part3-data!)))
     ;;...
     ]))
```

## Related resources about design in Clojure

While finishing this post, I discovered the awesome talk [Are You Writing Java in Clojure?](https://skillsmatter.com/skillscasts/12774-are-you-writing-java-in-clojure) by Erik Assum, which talks about many of the same things and I highly recommend it. Some of the resources Erik mentions are:

* **Functional Core, Imperative Shell** (from Gary Bernhardt's [talk Boundaries](https://www.destroyallsoftware.com/talks/boundaries)) - an "imperative shell" that wraps and uses your "functional core" and provides the core with all the data it needs and handles the desired effects. The core encapsulates the business logic and has no side effect. See [kbilsted/functional core, imperative shell.md](https://gist.github.com/kbilsted/abdc017858cad68c3e7926b03646554e) for more on this topic.
* [**Logic Sandwich pattern**](https://www.jamesshore.com/Blog/Testing-Without-Mocks.html#logic-sandwich) from _Testing Without Mocks_:

```
let input = infrastructure.readData();
let output = logic.processInput(input);
infrastructure.writeData(output);
```

## Conclusion

We have seen two different solutions in two different types of languages. Each approach could be implemented in each of the languages but a language encourages and makes it easier to write a particular way of solving the problem.

In particular we have looked at the separation of logic and side-effects (retrieving data, updating data, sending messages). Clojure nudges you to have nearly all of your code as pure functions and keep the (side-)effects at the boundaries of the system, at a few and clearly marked places, separated from the rest. We have also looked at a few ways how to deal with supplying data that might not needed and is expensive to retrieve.

## More from this series

1. [Solution design in Java/OOP vs. Clojure/FP - I/O anywhere or at the boundaries? - experience](/design-in-java-vs-fp/)
2. [Clojure vs Java: The benefit of Few Data Structures, Many Functions over Many Unique Classes](/clojure-vs-java-few-datastructures-over-many-objects/)
3. [Clojure vs Java: Troubleshooting an application in production](/clojure-vs-java-troubleshooting-prod-app/)
