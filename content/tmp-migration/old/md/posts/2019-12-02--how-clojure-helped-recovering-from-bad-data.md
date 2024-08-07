---
title: "How Clojure helped us recover from bad data"
category: "SW development"
tags: [clojure, experience]
---

On a calm autumn morning we got a desperate call from our customer service. Our biggest customer had just started a pilot of our "expense share" functionality - and was missing half of their data. And they absolutely needed them for sending salaries in a few days. We jumped into production, cross-checked the data against a few of the missing employees and quickly determined that they were missing from the incoming invoices. We were able to cut and glue pieces of production code to extract just the information we needed - counts of employees and invoices past, present, and expected for billing runs in the problematic period - and thus identify all affected customers. After a fix in the source system, we were able to repeat the billing runs without writing any data, just to verify it generated the correct results - and write the results later. Combining data from web services and the database, correlating them and massaging them just into the format needed, interactively, with immediate feedback - that was only possible thanks to the code being in Clojure and thanks to Clojure REPL. Without it, the troubleshooting and correction process would have been much more difficult and time-consuming. Let's look in detail how exactly did it help.

<!--more-->

(_Published originally at the [Telia Engineering blog](https://engineering.telia.no/how-clojure-helped-recovering-from-bad-data/)._)

## How does Clojure help?

Primarily in three ways:

1. Small, standalone functions with minimal dependencies
2. Separation of calculations and actions (i.e. the Functional Core, Imperative Shell architecture)
3. Data as a first-class citizen

### Small, standalone functions with minimal dependencies

The code is essentially a pipeline of data retrieval, transformation, and storage, composed of small functions, each taking in just the bare minimum of what it really needs. It is thus easy to pick, chain, and add to just the functions you need. And even if a function does more than you want - for example it runs the input data through a 4-stage transformation pipeline while you only want the first two stages - you can easily make a copy with just that, it is only a few simple lines of code. Here is an example of a typical function:

```clojure
(defn categorize-summarize-subscr-charges
  [feature-mappings subscr-charges]
  (->> subscr-charges
       (categorize+batch-filter-charges feature-mappings)
       (kd-rules/categorized-charges-check+filter)
       (charges->subscr-summary)))
```

As you can see it doesn't do much - it just coordinates other (small) functions. The original, object-oriented version of this code was implemented as a graph of cooperating objects, each typically with a couple of dependencies of its own, with mostly non-reusable private methods, and an occasional data retrieval in the middle of its code. It was intended and only could be used as a monolith, you couldn't pluck and re-combine its parts as we did here.

### Separation of calculations and actions

A key aspect of our design is the [Functional Core, Imperative Shell architecture (described elsewhere)](/design-in-java-vs-fp) - we first assemble all the data (though some is supplied few at a time via `core.async` channels due to memory limitations), then process it through side-effect-free "functional core," where 90% of the code lives and which produces a description of the desired effects, then apply the effects. The first and last part happen in the thin "imperative shell" / outer layer of the code. All "actions" happen there while all side-effect-less calculations happen in the core.

We leveraged this in two ways. First, we were able to run the process to verify that all the source data has been corrected, yielding the expected counts of employees, without affecting anything, by running only the data retrieval and calculations. We were also able to store the desired "effects" from the run into files and apply them later after validation and a go from stakeholders without needing to rerun the whole resource-intensive job. Second, we were able to use only the most outer level of the data-extraction code to get all the raw data, move them to a more powerful machine, and continue the processing there. (That was before we added `core.async` to solve the memory issues with large data sets.)

In general, having separated actions and calculations, we can safely run any function in the "core" (i.e. any calculation) and don't need to worry about any side-effects. We can control which side-effects and when to perform.

### Data as a first-class citizen

Object-oriented languages hide data in objects, each class unique to the entity it represents, with a unique "API." Clojure, on the other hand, similarly to JavaScript, uses mostly raw data - primarily maps and lists - and provides a rich and powerful library of functions to map, filter, reduce, combine, and search such data. That enables us to concisely extract only the subsets of data that interest us and combine them freely with other data to get just the information we need. Moreover data is easy to store to files as JSON or Clojure's native EDN, transfer it elsewhere, load it in and work further with it. I can't imagine serializing any random Java object graph.

Every data is in this form, no matter where it comes from - web services, database access code, ad hoc DB queries - so you can interactively get and combine data from all these sources to solve your problem.

You can also leverage generic data utilities - Clojure's `print-table` to show sequences of maps in a human-friendly form or a data diffing library to quickly find differences between two data graphs.

(I have written about this topic before, in [Clojure vs Java: The benefit of Few Data Structures, Many Functions over Many Unique Classes](/clojure-vs-java-few-datastructures-over-many-objects).)

## How does Clojure REPL help?

You can learn more about that in our post [Introducing a Clojure REPL server into our predominantly Java application has been the greatest productivity boost ever](/java-troubleshooting-on-steroids-with-clojure-repl).

## Conclusion

We benefited a lot from small, standalone functions with minimal dependencies that we could pick and combine to find out just the answers we needed, from separation of calculations and actions so that we could perform them at separate machines and verify results without publishing them to our users, and data as a first-class citizen which made data transfer and comparison possible. The REPL put all the power of our development tools, programming language, and functions at our fingertips and enabled us to iterate quickly toward the answers we are looking for. I cannot imagine how much more time and effort we would have spent if we did not have Clojure and the REPL at our disposal. I only wish we also had the [superpowers of Datomic](/talk-highlights-exploring-four-hidden-superpowers-of-datomic/) instead of our RDBMS so that we could have looked at relevant data as of the time of the original billing run, which would make the comparison of the original and "fix" runs more reliable.
