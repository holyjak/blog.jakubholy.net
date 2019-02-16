---
title: "Wiki"
---
Persistent computer-related notes that are still under development.


## Index of pages




  - [Development](/wiki/development/)
      - [Architecture](/wiki/development/architecture/ "Architecture")
      - [Development Books](/wiki/development/books/) - the most influential books about software development I've read
      - [Learning Programming](/wiki/development/learning-programming/ "Learning Programming") - resources
      - [Unit Testing Toolbox](/wiki/development/testing/ "Testing") (for Java) - collection of links to libraries, tools, concepts
      - [Performance & Performance Testing for Webapps](/wiki/development/testing/performance-testing-for-webapps-notes/ "Performance Testing for Webapps Notes")
      - [Ops: Monitoring](/wiki/development/ops-monitoring/ "Ops: Monitoring")
      - [Clojure](/wiki/development/clojure/ "Clojure") - links to libs, resources etc.
      - [Cloud](/wiki/development/cloud/ "Cloud")
      - [Code Conventions (Java)](/wiki/development/code-conventions-java/ "Code Conventions (Java)")
      - [Frontend](/wiki/development/frontend/ "Frontend")
      - [Practices](/wiki/development/practicies/ "Practices")
          - [Continuous Delivery](/wiki/development/practicies/continuous-delivery/ "Continuous Delivery")
      - [Compiled "Must Watch/Read" Resources](/wiki/development/compiled-must-watchread-resources/ "Compiled “Must Watch/Read” Resources") - JS, functional JS, ...
  - [Better Work](/wiki/better-work/ "Better Work") - creating more effective organizations with happier people and customers
  - [Tools & OS](/wiki/tools/ "Tools")
      - [Ubuntu@ThinkPad](/wiki/tools/ubuntuatthinkpad/ "Ubuntu@Thinkpad") - My experiences from running Ubuntu on Lenovo ThinkPad
      - [Eclipse](/wiki/tools/eclipse/ "Eclipse") notes and tricks
      - [Emacs/Aquamacs](/wiki/tools/emacs/ "Aquamacs/Emacs") mini-reference
      - [Vagrant notes](/wiki/tools/vagrant-notes/ "Vagrant Notes") and troubleshooting




### Development Wiki




  - [Economics of Coding](/wiki/development/economics-of-coding/)
  - [Risk-Based Testing](/wiki/development/risk-based-testing/ "Risk-Based Testing")
  - [Parallel Design (Parallel Change)](/wiki/development/parallel-design-parallel-change/ "Parallel Design (Parallel Change)")




## Tiny notes




### Linux




###### Lock user account



Disable: usermod --expiredate 1 \<login\>

Re-enable: usermod --expiredate 2099-01-01 \<login\>


### Tools



See the tools page for Git, Vim etc. notes


### Java Development




#### What is "enterprise"?



Common enterprise problems: database access, remote procedure invocation, transactions, authentication, directory services, auditing, integration of multiple services, authorization (roles, groups of roles, ...), LDAP, etc.


#### Source code & JavaDoc search sites




  - [GrepCode.com](https://grepcode.com/)
  - [jarvana.com](https://www.jarvana.com/jarvana/)




### Clojure & Ecosystem



Datomic


  - Not for write-heavy apps, i.e. apps with \>= 1MB/s sustained write throughput (even 1TB/year is perhaps not a best fit) - Essentially serializable writes (shardable via multiple transactors)
  - Note: Performance of the back-end storage doesn't matter so much - hot data cached on peers, most of the rest can be hold by a memcached cluster in front of the storage
  - A top for Datomic with a single transactor is perhaps around billion rows??
  - Great at answering question about past, what-if, audit trail
  - Good performance at joins for all in local (peer) memory, multiple pears can hold in memory quite different "hot data" for diff. use cases x monholitic DB
  - Classical RDBMs and languages based on constraints from 70s that no more true (expensive memory and storage, dedicated machines) - Datomic explores what we would design if we broke those constraints
  - Flexible: contrary to doc stores, here "documents" are assembled at query time =\> no need to decide ahead of time; schema can evolve much more freely
  - Programmable: everything is data (commands, queries, tx info) =\> easy to generate, combine, use
  - Consistency etc. - can use server-side functions to do multi-updates etc.
