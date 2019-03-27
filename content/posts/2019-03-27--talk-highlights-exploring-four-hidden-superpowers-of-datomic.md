---
title: "Highlights from the talk 'Exploring four hidden superpowers of Datomic'"
category: "SW development"
tags: [clojure, database, learning]
---

During our regular "tech lunch," we have got our brains blown by the talk [Lucas Cavalcanti & Edward Wible - Exploring four hidden superpowers of Datomic](https://youtu.be/7lm3K8zVOdY) ([slides](https://www.slideshare.net/lucascavalcantisantos/exploring-four-datomic-superpowers)) that summarizes the key benefits a startup bank in Brazil got from using this revolutionary database as the core of their technical backbone. We would like to share our highlights from the talk and a few other interesting resources.

<!--more-->

(_Published originally at the [Telia Engineering blog](https://engineering.telia.no/blog/talk-exploring-four-hidden-superpowers-of-datomic)._)

## What is Datomic?

Datomic is a transactional database (fully [ACID](https://docs.datomic.com/on-prem/acid.html)) targeting the same audience as PostgreSQL and Oracle but with a radically different design and "interface," created by the same people as Clojure. It is append-only (i.e. no data overwrites), all data is stored in the simple yet very flexible and powerful form of [entity-attribute-value-... tuples](https://docs.datomic.com/cloud/whatis/data-model.html), queries run typically in the memory of the application and are written in [Datalog](https://docs.datomic.com/on-prem/query.html), a declarative logic programming language. It may sound crazy but it actually makes great sense in the 21st century, contrary to the databases designed based on the constraints of 1970s.

## Highlights from the talk

The 4 + 5 superpowers of Datomic are:

(1) **Audit Trail** - data is immutable, Datomic never forgets what was true at a point in time and fully integrates the concept of time. You can thus look at the database as of a certain time to discover the source of an error, the sequence of events, or to try new code with a particular past situation. Every "insertion" of a fact belongs to a transaction, which can be annotated with additional metadata such as who did it, why, and a [correlation ID](https://docs.microsoft.com/en-us/azure/architecture/microservices/logging-monitoring#distributed-tracing).


(2) **Authorization** - ensure that a customer only sees her data. You can define custom "rules" that can check facts about the data and use them as predicates to filter results, for example `owns?` that detects whether an entity is - directly or indirectly - owned by the requesting customer. Rules use the same query language and can recursively call themselves, making it possible to traverse the data tree - e.g. find all entities owned by a customer. Moreover, you can use Datomic's `d/filter` to return a "view" of the database that contains only the data that satisfies a rule, i.e. only the data owned by the customer.

(3) **HTTP Caching** - with Datomic it is trivial to find out when any (set of) data - f.ex. any data of a customer - has last changed and return `304 Not Modified` if it hasn't changed since last, saving bandwidth.

(4) **Mobile Sync** - similarly you can use `d/history` and `d/since` to get the "diff" of the data between two dates and only send to the client the data that has changed.

(5) **Future DB** - you can easily "add" data locally to the database without "committing" them and pass this "future database" to your functions, for example to test a new piece of code that depends on the data.

(6) **Testing** - the [`d/with`](https://docs.datomic.com/on-prem/clojure/index.html#datomic.api/with) makes it easy to ensure a particular database state for a test without complicated set up and without any tear down. Moreover, a DB is just a collection of facts, so you can easily mock it in your code with normal data structures: `(let [testdb [fact1, fact2, ..]] ..)`

(7) **Extend schema** Every attribute in Datomic has a schema, defining its type (string, long, ..), cardinality, name, etc. But you can add your own attributes to the schema. The speakers have added `:nubank/transform` with values such as `:pii`, instructing their code that thus annotated attribute holds personally identifying information and needs to be encrypted at rest. (RDBMS databases certainlydon't let you extend their Data Definition Language to add new attributes to columns!)

(8) **Sharding reads** Note: Datomic doesn't do sharding so I am not sure what they spoked about. What you can do is create multiple "peers" - the servers that do the querying in their own memory - or (in Datomic Cloud) "[query groups](https://docs.datomic.com/cloud/whatis/architecture.html#query-groups)" for different user groups, such as production vs. analytics, so that heavy queries of one group do not affect the other ones. You can also split your database into multiple databases [not sure how that works] or partition your data for more efficient caching.

(9) **DB aggregation** When you have multiple databases - physical or "virtual" - it is [trivial to query over all of them with a single query](https://cjohansen.no/querying-across-datomic-databases/) - just pass all of the databases as arguments to your query.


## Other recommended resources

* [What Datomic brings to businesses by Val Waeselynck](https://medium.com/@val.vvalval/what-datomic-brings-to-businesses-e2238a568e1c) - explains the value of Datomic in business terms while also providing the technical background, mentions some drawbacks, and shares his company's experiences with it. Benefits: high query power => it’s straightforward to translate a question about data to code, no data loss, straightforward and flexible data modeling, simplified testing, easy to reproduce the circumstances of a bug in your local environment, easy to detect "what changed" and send that to other systems, great performance characteristics for the most common use cases, some of the hardest problems with databases are gone (object-relational impedance mismatch, N+1 selects problem, cache invalidation, concurrency). Other highlights: From MongoDB and NodeJS to Datomic and Clojure: <q>In 4 weeks, 13k lines of hacky, untested JavaScript code turned into 9k lines of well-tested Clojure code (plus 3k lines of tests). After migrating, our situation drastically improved, mostly because of the above-mentioned properties of Datomic (although Clojure’s interactive development story also played a significant role in increasing productivity and quality): - the time we spend fixing bugs has gone down below 5% [from 30-50%], [..]</q> <q>Datomic enables us to write mostly system-level tests [... which] yield much more coverage</q>
* Talk [Domain modeling with datalog by Norbert Wojtowicz](https://youtu.be/oo-7mN9WXTw) - <q> This talk introduces Datalog from its primitives and builds a mental model of how complicated queries can be resolved using simple data structures. This, in turn, will help you understand when and how you should apply Datalog in practice: on the client, on the server, as a graph database, as a communication protocol ala GraphQL/Falcor, or as an event-sourcing storage mechanism.</q> A well done introduction to querying with Datalog and data modeling with entity-attribute-value on the example of GitHub, demonstrating the power and simplicity of Datalog. Mention of (possibly recursive) "rules" e.g. for graph traversal with upfront unknown distance, creating a "subset view of a DB" with `filter`, annotating transactions with additional metadata for troubleshooting. On the model - every new feature typically adds a new relation (playlist = user -> songs, ...) which leads in RDBMS to more joins and a performance nightmare while in Datalog/Datomic it is just new facts, i.e. more of the same. Explanation of how Datomic can be used as relational (table-based) / key-value / graph /... storage, having 4 indices to support all these traversals. Briefly about Pull API, i.e. "GraphQL on steroids".
* Talk [KotlinConf 2018 - Datomic: The Most Innovative DB You've Never Heard Of by August Lilleaas](https://youtu.be/hicQvxdKvnc) a really good talk that presents the "weird" things about Datomic (single write thread, client-side queries, weird transactions, 4 ["covering indices"](https://en.wikipedia.org/wiki/Database_index#Covering_index)) and how they actually make perfect sense, plus a demo of inserting, querying, and updating data and of "time travel"
