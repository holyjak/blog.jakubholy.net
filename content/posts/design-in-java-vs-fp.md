---
title: "Solution design in OOP (Java) vs. FP (Clojure) - isolation of I/O or not?"
tags: [clojure, java, design]
---

As a Clojure developer thrown into an "enterprise" Java/Spring/Groovy application, I have a unique opportunity to experience and think about the differences between functional (FP) and object-oriented programming (OOP) and approach to design. Today I want to compare how the solution would differ for a small subsystem responsible for checking for and progressing the process for fixing data discrepancies. The main question we will explore will be where do we deal with external effects. i.e. I/O.

I see OOP as a graph of mutable and possibly side-effectful object, while FP as compositions of primarily pure, side-effect free functions. FP tends to push I/O and other (side-)effects to the edges of the system.
These are just "cultures" and you are anyway free to create many different designs, aligned with them or not. Many even in the OOP world have noticed that spreading mutation and effects all around makes maintenance difficult. Still, the culture of the programming language leads you to think in certain ways and more likely to come with some designs than others.
Let's look at the problem at hand and what would be the more "natural" way of solving it in Java/OOP and Clojure/FP.

### The problem

The problem to solve is the validation and correction of the billing cycle length of our customer organisations. The process is as follows:

1. Verify that all invoice centres within the organisation have the same billing cycle length and use that as the organisation cycle length; if any invoice centre differs, set the org cycle to "UNKNOWN"
2. If the cycle length has just changed from a valid value to UNKNOWN then notify the Customer Service to fix it, record that we have started fixing this org together with its previous valid cycle length
3. If the current cycle length is UNKNOWN but we have already started fixing it, do nothing (or send a remainder to C.S. if it has been too long)
4. If the cycle length has just changed from UNKNOWN to a valid value (as a result of C.S. fixing the maverick cost centre), record that it is fixed and proceed normally (but see 5.)
5. If the cycle length has changed to a valid value different from the previous valid value, notify C.S. that they need to check whether any cycle-level limits need to be adjusted and record that we need to await the result of the manual check

### The Java solution

Let's zoom in into the heart of the solution:

``` groovy FIXME
@Component // So that Spring will instantiate it and inject all @Autowired dependencies
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

And the big picture: **TODO**

### The Clojure solution

We could do the same but it feels wrong to have a function producing plenty of side effects (and no result). Thus an interesting question thus arises: How to separate pure business logic and the execution of effects, or how to make the core function pure (i.e. just taking arguments and producing a result)? The result part is simple, we can take inspiration from the frontend frameworks [Redux](https://redux.js.org/) or [re-frame](https://github.com/Day8/re-frame#it-is-a-6-domino-cascade) and just produce a map of the desired effects, such as `{:email {:to .., :body ..}, :db {:insert {...}}}` that are later executed by registered _handlers_. But what about the additional data the function _might_ need from the database? For that I can now think of three solutions and there are surely more:

1. If the data is small, just fetch it eagerly all into the memory before invoking the pure function.
2. Similarly yet differently, provide the function with a lazy datastructure that only fetches the data when it is actually accessed (via [`delay`](https://conj.io/store/v0/org.clojure/clojure/latest/clj/clojure.core/delay/)). Thus the effect happens in the function but is transparent to it, it doesn't know or care whether the data already was there or not or how is it produced.
3. Follow more of Redux/re-frame, making the process multi-pass: when the function is invoked and lacks some data, it will produce an effect asking for it (for example `{:db/find {:table "xyz" :id 123}}`); the "framework" will process it and re-invoke it when the data becomes available.

``` FIXME clojure
(ns app.billing)
(defn handle-change [{:keys [ctx org-id current-cycle previous-cycle corrections-wip]}]
  (cond
    (and (= current-cycle UNKNOWN) (not= previous-cycle UNKNOWN))
    (handle-newly-unknown {:org-id org-id, :previous-cycle previous-cycle})

    ;; case 2
    ;; case 3
    :else (throw (Exception. "should have been handled above come here"))))

(defn handle-newly-unknown [{:keys [ctx org-id previous-cycle]}]
  {:email {:to (get-in ctx [:settings :cs-email]), :body "...", :subject "..."}
   :db {:TODO}
   :log {:level :info, :id ::correction-triggered, :data {:org-id org-id}, :msg "Started fixing ..")})
```

Notes:

1. `corrections-wip` is the content of the `Billing_Cycle_Corrections` table (case nr 1. or 2. above)
2. The log format comes from Frankie Sardo's very inspiring article [
Logging: change your mind – The ultimate guide on modern logging](https://juxt.pro/blog/posts/logging.html).

**TODO: schema of the whole process; where are the handlers, data fetching, ...**

## Conclusion

Two different solutions in two different types of languages. Each could be implemented in each of the languages but each encourages and makes easier to write one of them.
