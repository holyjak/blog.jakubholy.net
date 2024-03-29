---
title: "Translating an enterprise Spring webapp to Clojure"
category: "SW development"
tags: [clojure, java, clojure-vs-java]
---

How to translate the concepts and patterns we know from enterprise Java applications to Clojure? It is not just a different syntax, the whole philosophy of the language is different. The thing is, many concepts and patterns do not translate - you just do things differently. We will look shortly at how we can solve common enterprise concerns in Clojure, compared to Java.

This post is intended for an experienced Java developer curious about how his object-oriented, enterprise know-how would translate into the world of functional programming.

If you are short on time then just scan the [Summary table](#summary-table) and read [Basic principles](#basic-principles) perhaps together with [Clojure primer](#clojure-primer-optional) to make sense of it.

<!--more-->

## Summary table

Abbreviations: HoF = higher-order function

| Concern                | Java                                                    | Clojure                                                                                              |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Code structure         | controller/, \<domain\>/, ...                           | Evolve as needed                                                                                     |
| Architecture           | 3-tiered: web, services, integration                    | Similar but evolved as needed + _Functional Core, Imperative Shell_                                  |
| IoC                    | Spring's `@Component` + `@Autowired` everything         | Typically not needed; use namespace-local "singletons" or pass around in a context object            |
| AOP                    | Use `@Aspect` + `@Around`, perhaps based on annotations | Typically not needed; wrap with higher-order functions/macros. Use `alter-var-root` if you must      |
| Cross-cutting concerns | E.g. `@Authorization`, `@Scheduled`, `@Timed`           | Be explicit. Wrap with higher-order functions/macros.                                                |
| Logging                | Logger in each class, XML/code config.                  | Same, use the `clojure/tools.logging` facade                                                         |
| Request tracking       | ThreadLocal to store, AOP/Filter to set                 | ThreadLocal or a context attribute to store, Ring middleware or a HoF to set                         |
| Resource pooling       | Inject the configured pool via IoC                      | See IoC above                                                                                        |
| Request decoration     | Servlet Filters                                         | Ring middleware                                                                                      |
| Testing                | Mocks FTW!                                              | Call pure functions as-is. Set a namespace singleton/pass context attribute for the Imperative Shell |
| Data transfer          | POJOs, DTOs + mapping code                              | Maps, sets, sequences + minimal/no data selection/transformation code                                |

## Clojure primer (optional)

Clojure is a dynamic, functional language running on the JVM. Instead of wrapping data with types such as Employee and Department it uses sequences, sets, and maps and has powerful functions to work on these. The building blocks of any Clojure program are (mostly side-effect free) functions, grouped into namespaces. A namespace typically maps to a single file and is similar to a JavaScript module. You can "extend the language" and implement e.g. a new control structure - in general write code that writes code - with macros (though this is uncommon in application code).

For map keys Clojure typically uses _keywords_, which are unique identifiers such as `:age` or `:first-name`. It has a few constructs to sane multithreading such as _atoms_, essentially thread-safe references.

I will also be mentioning [Ring](https://github.com/ring-clojure/ring), the most popular Clojure web application library / HTTP server.

## Basic principles

One of the reasons why you cannot just map 1:1 Spring and Clojure concepts is that they differ considerably in their approach and the principles they embrace.

Spring is a framework. It wants to do everything for you and it needs to control your code to do that. You annotate your methods with annotations such as `@Transactional` and `@Scheduled` to hook into Spring and tell it how/when to invoke your code and you can register various "interceptors" to hook into its processing (e.g. of requests) at defined points. You can use Aspect-Oriented Programming to hook anywhere into the execution of your code and handle cross-cutting concerns, for example monitoring of all public methods in Service classes. (My impression is that Java EE has more less the same approach nowadays.)

In Clojure there is a strong focus on simplicity and thus also a strong preference of libraries - code you call - over frameworks - code that calls you. There is far less need for frameworks because of Clojure's powerful composability, higher-order functions, and macros. You need to do little more work yourself (f.ex. explicitly list all of your batch job functions and manually schedule them) but, thanks to Clojure's expressivity, it is often just a few lines and it makes it much clearer what is happening in the code.

So in Java you tend to have general-purpose frameworks that you hook into while in Clojure you yourself "grow" a solution tuned to your particular problem, leveraging simple, single-responsibility libraries. You avoid repetition through higher-order functions and, if need be, macros.

## The translation

So how do we translate what we do in a Spring enterprise (web)app to a Clojure alternative?

Beware that this is my own take on the problem and it is strongly colored by my preferences.

### Code structure

In Java you often start with creating directories for `controllers/`, (stateless) `services/` and DB `repositories/`. (Though I and many [object to structuring based on technical artifacts](http://johannesbrodwall.com/2012/07/10/how-changing-java-package-names-transformed-my-system-architecture/), preferring instead to structure code by domain, e.g. `order/`, `products/`, etc.)

Somebody commented that the worst Clojure codebases s/he has seen began in the same way. For Clojure it is natural not to start with pre-designed code structure but let it grow organically, add and split namespaces as necessary.

I have also heard that we can keep in our heads just few hundred lines of code. With a good code structure that number can grow by the factor of 10. Clojure reportedly uses far fewer lines than a comparable Java codebase. So while any non-trivial program in Java will soon hit the memory limit and require a good structure and it thus makes sense to begin with one, with Clojure you have far more chances to fit within it and can thus postpone restructuring until you need it - and until you have a much better understanding of the problem and domain. (Which doesn't mean that you should not structure your Clojure code well, only that you don't need to start with some artificial "best practice" code structure.)

So you start with a `core` namespace. Eventually you notice you have a few functions dealing with orders and extract an `order` namespace. Over time you develop a few utilities for working with xml and put them into an `xml` namespace. You put JDBC code into `db` and later split out separate `order.db` and `product.db` when these grow too large.

### Architecture

In Java we are used to the 3-tiered architecture with the web Controllers, (mostly) stateless business logic "Services," and an integration layer with DB Repositories and Connectors to external services. We don't want Servlet API or JDBC invading our business logic so we keep them to their respective layers.

This works just as fine with Clojure though it is simpler to implement because everything is just maps and sequences. We typically only need to pick a subset of a map and send it on instead of translating from one object API / class hierarchy to another. So we would still keep our server code in some kind of a `web` namespace and our DB code in `[domain.]db`. We certainly wouldn't start by creating "repositories" for each and every domain entity.

One thing we want to do differently is to keep most (90+%?) of our code "pure," without side-effects, and herd all the effectful code to a few, clearly marked parts of the code base. One way to do that is the [Functional Core, Imperative Shell](https://gist.github.com/kbilsted/abdc017858cad68c3e7926b03646554e) approach, likely implementing a "[logic sandwich](https://www.jamesshore.com/Blog/Testing-Without-Mocks.html#logic-sandwich)." I have written about that in [Solution design in Java/OOP vs. Clojure/FP - I/O anywhere or at the boundaries? - experience](design-in-java-vs-fp/). The key point is that you have a thin layer that deals with communication with the external world and calls to your functional core that just takes arguments and returns some values, without any side-effects.

Side note: Go read Johannes Brodwall's [The madness of layered architecture](http://johannesbrodwall.com/2014/07/10/the-madness-of-layered-architecture/).

### Cross-cutting concerns

#### Inversion of Control / Dependency Injection

In Spring you just annotate your constructors with `@Autowired` and it will magically inject all the services and repositories you need. While IoC is fine, I prefer to avoid magic and put my system together manually when feasible. I also think there is far less need for this in Clojure.

We need to step back and ask, why do we need IoC? Some possible answers:

* Configure an object once and use it everywhere, e.g. a pooled DataSource or a ConnectionFactory
* So that we can use a fake e-mail service in the test environment
* So that we can inject an instrumented Repository in a test to be able to check that the expected method is invoked

There are perhaps other good reasons but I cannot think of any now.

So it appears to me that we use IoC to control configuration (real or fake service?) and state, especially for expensive-to-create objects. Both only make sense in relation to external effects of the system, i.e. when calling an external service or database. It doesn't seem so useful for business logic, which doesn't really change with the environment and does not depend on expensive stateful objects. It would also appear that the main reason for using IoC over singletons is testability. IoC also makes it possible to replace dependencies with mocks and thus test a (business logic) class in isolation. (Though many consider mocking to be an anti-pattern, see e.g. [Testing Without Mocks](https://www.jamesshore.com/Blog/Testing-Without-Mocks.html), [Kent Beck's functional composition of the processing (#3)](https://blog.jakubholy.net/2011/11/21/principles-for-creating-maintainable-and-evolvable-tests/), [Mocking is a Code Smell](https://medium.com/javascript-scene/mocking-is-a-code-smell-944a70c90a6a).)

[Martin Fowler justifies IoC with](https://martinfowler.com/articles/injection.html) "_so we can use different implementations in different deployments_." Another article [claims an important benefit of IoC to be](https://www.javaworld.com/article/2071914/excellent-explanation-of-dependency-injection--inversion-of-control-.html) "_Objects can be added and tested independently of other objects, because they don't depend on anything other than what you pass them._" Also the discussion in [Singleton: Anti-Pattern Or Not](https://sergeyzhuk.me/2017/07/11/singleton/) might be of interest.

Let's change perspective and ask where - whether? - can this be useful in Clojure. There we have mostly pure functions calling other functions. Impure functions either expect to get the relevant state explicitly as a parameter - for example all `java.jdbc` functions take a `db` parameter - or depend on a global or thread-local state (an atom, a dynamic var). What solutions do we have?

1. Let the integration-layer namespace manage the state it needs, such as creating a data source in a `ds` namespace and storing it in an atom for all functions to use implicitly. (We frown upon global mutable state in FP but in this case it is effectively a constant. It makes the functions impure as they depend on something beyond their arguments but it is a pragmatic solution that works well.)
2. Initialize the state at the program's entry point and pass it around explicitly in a "context" parameter (this is essentially IoC/DI!). That's what I propose below under "_Logging_". Of course you want to avoid having to pass the context through deep call stacks. _Functional Core, Imperative Shell_ helps with that since it is only the thin imperative layer that needs this.
3. Use a IoC system such as [Component](https://github.com/stuartsierra/component) or [Mount](https://github.com/tolitius/mount) to handle passing the state around. (I believe that the main task of these libraries is not IoC but ensuring that subsystems are started and stopped in the right order, IoC is only means.) There was an interesting discussion about these libraries in [Apropos #5](https://www.youtube.com/watch?v=DdbVu17AaDQ) and the panel agreed that they did not really encounter the need for them.

So what would I do? I would mix and match #1 and #2 as fit, with a preference for the latter. So I might just set up a data source inside my `db` namespace, use it implicitly in all DB calls, and perhaps expose a `set-db!` function to make it possible to change it from my tests so that I can use a per test DB.

How do we address the concerns of IoC? To enable different implementations in different environments (test vs prod) we can simply use configuration - for example in our internal `send-email` function we can check (pseudocode) `if (email service is configured) then (service/send ...) otherwise do nothing`. This approach worked just fine in our JavaScript app. To enable testing when using namespace-local state such as a db instance, we can expose functions to change it for the sake of the test, as shown above.

#### Aspect-Oriented Programming (AOP)

AOP makes it possible to execute code around / instead of any method, using a pattern to find the methods to wrap. It is very powerful but it is black magic that makes your code hard to understand. You literally cannot see what is happening when reading the target code unless you also know to look at the AOP code. I prefer code that is obvious, even if it requires little more typing. Sometimes the benefits are worth it - but rarely. Also, as this StackOverflow discussion explains, [Clojure doesn't really need AOP](https://stackoverflow.com/a/5573492/204205).

In our Java app we use AOP f.ex. to set up "execution context" for our batch jobs. These are started automagically by Spring based on their `@Scheduled` annotation so we don't really have any other good way to control their execution and do the set up. In Clojure I would forego auto-discovery and other magic and simply had a list of the batch job functions and schedule and run them manually. That would also give me control over their execution and enable me to set up whatever I want.

When AOP is really the best answer, you can use Clojure's [`alter-var-root`](https://clojuredocs.org/clojure.core/alter-var-root). Look at how [clojure/tools.trace' `trace-ns` does it](https://github.com/clojure/tools.trace/blob/tools.trace-0.7.10/src/main/clojure/clojure/tools/trace.clj#L376). We use it often in development to automatically check that function arguments conform to their [specs](https://clojure.org/about/spec) or during troubleshooting to automatically capture and print the arguments and return values of the relevant functions. To summarize:

1. Avoid AOP as much as possible. Invoke your code manually, then you can do whatever you need manually.
2. Explicitly wrap code that needs some special pre/post/around handling in a (higher-order) function/macro that does it.
3. When unavoidable, use Clojure's introspection and `alter-var-root`

#### Logging

We can use the same solution as Java, likely using Clojure's facade [`tools.logging`](https://github.com/clojure/tools.logging) with an appropriate backend (Logback/...). Personally I really like Frankie Sardo's approach from [
Logging: change your mind – The ultimate guide on modern logging](https://juxt.pro/blog/posts/logging.html) where he explicitly passes a log "instance" to functions that need it (there aren't that many, you typically only need it in the "Imperative Shell" layer) including whatever the current logging context is (instead of a global `MDC.put(key, val)`).

#### Authorization

In our Java app we can annotate a controller method with its authorization requirements:

```java
@RequestMapping(value = "{org_nr}/devices")
@Authorization(
        resource = @TargetResource(type = ORGANIZATION, identifiedBy = "org_nr"),
        requiresPermission = ANY_ROLE,
        requiresAuthenticationLevel = TWO_FACTOR
)
List<Devices> getDevices(...)
```

and there is a Spring `HandlerInterceptor` that checks for this annotation on the target method before allowing request processing to proceed.

There are multiple ways to implement it. We could use Ring middleware (similar to Servlet filters) to do similar magic to the Spring interceptors. However I prefer more explicit solutions as they are far easier to understand. Since a request handler in Ring is just a function of `request map -> response map` we could easily wrap it with another function that checks the authorization before invoking it:

```clojure
;; BEFORE:
;; (GET "/devices" [req org-nr] (get-devices org-nr))
;; AFTER:
(GET "/devices" [req org-nr]
  (check-auth
    {:target [:organization org-nr]
     :role :any
     :level :two-factor}
     req
    #(get-devices org-nr))))
```

So before we call `get-devices`, `check-auth` uses the auth requirements we pass it and user information in the request (prepared likely by a middleware) to decide whether to proceed or not. (BTW the `#(..)` produces an anonymous function of - in this case - 0 arguments that `check-auth` would explicitly invoke after it approves the request.)

#### Monitoring

What do you want to collect metrics for? For example:

1. All requests (duration, status code) -> do it in a Ring middleware
2. Particular business functions (=> e.g. how often is this functionality used?) - see below
3. All DB queries - either wrap the `java.jdbc` functions you use with monitoring code or use AOP (see below) to instrument them

To monitor a particular function, in Spring Boot we can just annotate it with `@Timed(some settings...)`. Similarly to how we handled authorization, we can replace the annotation with a function call:

```clojure
(defn important-busines-function []
  (monitor
    {:some-monitoring-settings ...}
    (do-something-important)))
```

It is not more typing than with the annotation and you can much more easily see what is going on.

(`monitor` could be a macro to get control over the evaluation of its body or we could pass it the original code wrapped in a lambda. It could directly change some global state - the metrics registry - or just add monitoring information to the current "context" if we are passing that around.)

#### @Transactional

Replace

```java
@Transactional
void transferMoney(Account from, Account to, Amount a) {
  ... lot of logic and some DB operations here ...
}
```

with

```clojure
(defn transfer-money [from to amount]
  (java.jdbc/with-db-transaction [conn my-db]
    ... lot of logic and some DB operations here ...))
```

no big deal, huh?

#### ThreadLocal for request tracking

Our Java app uses a ThreadLocal to store "unique request ID" so that we can trace a request across multiple systems. We could do the same in Clojure or pass it explicitly in our "context" argument. Thanks to Functional Core, Imperative Shell we need it only in the thin outer imperative layer so passing it around explicitly isn't all that much work (and doesn't break when you involve asynchronous code).

#### `@Scheduled`

We have batch jobs like

```java
@Scheduled(cron = "0 30 1 * * ?")
void cleanupExpiredOrders() { ... }
```

that Spring runs automatically for us.

#### Resource pooling

You wan't to have e.g. a data source with a connection pool and use it in all DB calls or have a thread pool that you use for a particular subset of external service calls. The solution under "_Inversion of Control_" above applies.

### Other

### Java Servlet filters

Use Ring's middleware, simple higher-order functions working on the request and response maps and wrapping the request handler / other middlewares. Once again a higher-order function is the solution :-)

## Examples of production Clojure (web)apps

See the awesome [ClojureVerse thread 'Example “enterprise” Clojure (web) app?'](https://clojureverse.org/t/example-enterprise-clojure-web-app/4034/5), mentioning e.g.

* [NASAs Common Metadata Repository](https://github.com/nasa/Common-Metadata-Repository) - a large collection of (web) applications, very readable, and there’s lots to see
* [Clojurecademy Web Application](https://github.com/clojurecademy/clojurecademy)
* [metabase](https://clojureverse.org/t/example-enterprise-clojure-web-app/4034/5) - The simplest, fastest way to get business intelligence and analytics to everyone in your company

Also [Datomic/mbrainz-importer](https://github.com/Datomic/mbrainz-importer) - ETL pipeline in Clojure leveraging core.async, transducers, specs, separation into small, pure functions

## Conclusion

You cannot map Java/Spring enterprise (web)app concepts 1:1 to Clojure because the two have very different capabilities and values. You need to embrace Clojure's way of thinking and leverage its power - higher-order functions, macros, composition, data structures - to achieve your goals.
