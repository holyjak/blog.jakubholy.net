---
title: "Performance & Performance Testing for Webapps"
---
*\! work in progress \!*


## Key Performance Goals



Requirement format: "X should be less than L in P % times when the load is U users"


  - Request throughput
  - Latency
  - Max/avg response time from the end user's point of view




## Performance Metrics




### The Utilization Saturation and Errors (USE) Method



The [USE Method](https://www.brendangregg.com/usemethod.html) of performance analysis focuses on getting a complete overview of a system (without forgetting anything) and discovering quickly most of the performance problems. The main tool is a system-dependant checklist of resources and metrics of utilization, saturation (i.e. work that has to wait), and errors for each resource. Read more on its page, which also contains checklist for some systems.


### Java EE App Stress Testing (A. Bien)



Goal: Test contention (=\> dead/live-locks), transaction isolation, caching behavior, consistency, robustness, performance, memory consumption.


  - Memory, current heap size
  - Typical / peak \# of worker threads
  - Usual depth of the request queue
  - \# rolled back transactions (f.ex. due to optimistic locking) vs. successful ones
  - \# requests/sec
  - \# & length of major garbage collections
  - \# DB connections
  - Size of JPA caches




  - all of these should be stable, i.e. not grow (too much) with time / growing load.



Ex.: JMeter + VisualVM (with the MBean plugin to monitor custom caches and with Visual GC) to observe the behavior live.


### Level: Browser



TBD (network latency, rendering time, ... - use FireBug's timing capability or some similar browser plugin)


### Level: Server



Resource utilization (from [New Relic docs](https://www-staging.newrelic.com/docs/server/using-the-server-monitor-ui)):


  - Cpu busy \[%\] - the percentage of the time that the system is using the CPU
  - Disk busy \[%\] - the percentage of the time that the system is performing Disk IO
  - Memory used \[%\]
  - Disk space used \[%\]
  - Network utilization \[Mb/s\]
  - Drilling down into processes - their count, CPU, memory




### Layer: Servlet Container / EJB Container



TBD (JVM heap, threads, ...)


  - Servlet Container
      - \# threads (unless NIO used, i.e. \# concurrent requests being processed)
      - ...
  - Database
      - No. free connections in connection pools
      - Avg. time connection is used by a thread (how long away from the pool)
  - EJB Container
      - Bean pool utilization
      - ...
  - ...




### Layer: Application



TBD (\# concurrent users, \# errors/exceptions, ...)


### Layer: Database



TBD


## Common Performance Issues




### Apache



(I don't remember the resource for this :-( )


  - No more File Descriptors
      - • symptoms: entry in error log, new httpd children fail to start, fork() failing everywhere
      - • solution: increase system-wide limits, incr. ulimit via apachectl
  - Sockets stuck in time\_wait
      - • sympt.: unable to accept new conn., CPU under-utiliz. & httpd proc. idle, not swapping, netstat shows \# sockets in time\_wait
      - • many t\_w are to be expected, only a problem when new conn. failing =\> decrease sys-wide TCP/IP FIN timeout
  - High Mem Usage (swapping)
      - • sympt.: (ignore system free mem, misleading): \# disk activity, top/free show high swap usage, load gradually increasing, ps shows processes blocking on disk i/o
      - • sol.: add mem, ...
  - CPU overload
      - • sympt.: top shows little/no cpu idle time, \*not\* swapping, high load, much cpu spent in userspace
      - • sol.: add cpu
  - Interrupt (IRQ) overload
      - • sympt: (freq. on 8+ cpu machines) not swapping, 1-2 cpu busy rest idle, low total load
      - • sol.: add NIC




## Doing Performance Testing Correctly




### Jetty on Load Testing



The [Jetty High Load Howto](https://wiki.eclipse.org/Jetty/Howto/High_Load) has some good tips on creating realistic load testers and on configuring the load testing and server machines (TCP buffer sizes, in/outbound connection queue size, \# file, \# ports, congestion control). F.ex.:


> \- A common mistake is that load generators often open relatively few connections that are kept totally busy sending as many requests as possible over each connection. This causes the measured throughput to be limited by request latency (see [Lies Damned Lies and Benchmarks](https://blogs.webtide.com/gregw/entry/lies_damned_lies_and_benchmarks "http://blogs.webtide.com/gregw/entry/lies_damned_lies_and_benchmarks") for an analysis of such an issue.
>
> \- Another common mistake is to use a TCP/IP for a single request and to open many many short lived connections. This will often result in accept queues filling and limitations due to file descriptor and/or port starvation.
>
> A load generator should well model the traffic profile from the normal clients of the server. For browsers, this if mostly between 2 and 6 connections that are mostly idle and that are used in sporadic bursts with read times in between. The connections are mostly long held HTTP/1.1 connections.



It recommends the [Cometd Load Tester](https://cometd.org/documentation/howtos/loadtesting "http://cometd.org/documentation/howtos/loadtesting") for a good example of a realistic load generator


## Tools




### Simple tools



Web servers


  - **ab** (Apache Benchmark) - ex: *ab -n 10000 -c 250  \<page URL\>* - generate 10k GETs for the URL, issuing 25o in parallel (limited by the number of sockets a process can open on the test machine)
  - [**siege**](https://linux.die.net/man/1/siege) - http/https stress tester - available in the software repositories of most Linux distros
  - [wrk](https://github.com/wg/wrk/) - a HTTP benchmarking tool wrk is a modern HTTP benchmarking tool capable of generating significant load when run on a single multi-core CPU. It combines a multithreaded design with scalable event notification systems such as epoll and kqueue.
  - [fortio](https://fortio.org/) - similar to siege; runs at a specified query per second (qps) and records an histogram of execution time and calculates percentiles (e.g. p99 ie the response time such as 99% of the requests take less than that number (in seconds, SI unit)). It can run for a set duration, for a fixed number of calls, or until interrupted



Databases


  - MySQL: **[mysqlslap](https://dev.mysql.com/doc/refman/5.6/en/mysqlslap.html)** - simulates a number of clients connecting to the DB and performing a query of your choosing




### On-line tools




  - [Blitz.io](https://blitz.io/) - load-testing service based on curl-like tool, very easy to use and with nice graphs, can simulate tens of thousands of concurrent users from different location on the Earth
  - [Pingdom](https://www.pingdom.com/) - "uptime and performance monitoring made easy" - I haven't tried this




### Apache JMeter




#### General




##### Max Number of Concurrent Users



The number of concurrent virtual users JMeter can efficiently simulate depends on the resources of the test machine (memory, thread limits, socket limits, network card speed, ...), the complexity of the test, and other load on the system. In general [it's recommended to use 1000 or less threads](https://wiki.apache.org/jmeter/HowManyThreads) - of course assuming that you don't perform any extensive report gathering/rendering and [reduce JMeter resource consumption](https://jmeter.apache.org/usermanual/best-practices.html#lean_mean) as it would steal resources available for the testing. With bad configuration or machine you can experience problems already with a much lower thread count.

Notice also that if you don't introduce any "think time" into your test plans than a single JMeter thread can generate much higher load than a human user could and thus a single thread can correspond to e.g. ten humans.

If you need more virtual user then you need multiple JMeter instances (preferably on multiple machines) in the master-slave configuration or as independent instances, compiling the individual reports yourself, if the overhead of master-slave communication is unacceptable for you.

Check this [blog for some tips](https://theworkaholic.blogspot.com/2009/09/running-jmeter-for-large-number-of.html) (2009).

From the Gatling stress test tool docs (referring to JMeter 2.5.1):


> JMeter creates one thread per user simulated. If there is not enough memory allocated to the JVM, it can crash trying to create these threads. For instance, JMeter could not run 1500 users with 512 MB (what was used for Gatling even with 2000 users); OutOfMemoryErrors are recorded in the table as **OOM**.
>
> Another problem occurred with the 2000 users simulations; it seems that JMeter can not simulate more than 1514 users independently from the memory that was allocated to the JVM.




### Gatling



[Gatling](https://gatling-tool.org/) is a new (2012?) stress test tool, written in Scala and using Akka. Tests are described by a fluent API in a "text" or richer scala format. It claims high efficiency (2000 users simulated where JMeter couldn't handle over 1500 and with much lower memory consumption of 512M). So far I haven't noticed anything about distributed testing (certainly needed for 10s of thousands of users).


### Banchmarking




#### SysBench



"[SysBench](https://sysbench.sourceforge.net/) is a modular, cross-platform and multi-threaded benchmark tool for evaluating OS parameters that are important for a system running a database under intensive load." Last release 2004.


#### Disk: hdparm -t, bonnie++, iozone



See the blog post [Disk IO and throughput benchmarks on Amazon’s EC2](https://stu.mp/2009/12/disk-io-and-throughput-benchmarks-on-amazons-ec2.html) (2009) for examples og use.


#### DBT-{1-5} - The Database Test Suite



[DBT-\* is a suite of database tests](https://sourceforge.net/apps/mediawiki/osdldbt/index.php?title=Main_Page): DBT-1<sup>TM</sup> (Web Server)  simulates the activities of web users browsing and buying items, DBT-2<sup>TM</sup> is an OLTP transactional performance test, DBT-3<sup>TM</sup> is decision support workload (business oriented ad-hoc queries and concurrent data modifications), DBT-4<sup>TM</sup> is an application server and Web services workload, DBT-5<sup>TM</sup> is an OLTP workload simluating the activities of a brokerage firm.

For ex. [Xeround used it to compare its Cloud Database with Amazon RDS](https://xeround.com/cloud-database-comparison/xeround-vs-amazon-rds-benchmark/) (7/2011?).


### Web page performance testing




  - [Google PageSpeed tools](https://developers.google.com/speed/pagespeed/) ([online](https://developers.google.com/speed/pagespeed/insights/)/Chrome extension) - provides recommendations
      - Also [Mobile-Friendly Test](https://www.google.com/webmasters/tools/mobile-friendly/)
  - [YSlow](https://yslow.org/) - browser plugin
  - Chrome/FF DevTools - Timing




## Related




  - [The Value and Perils of Performance Benchmarks in the Wake of TechEmpower’s Web Framework Benchmark](/2013/04/01/the-value-and-perils-of-performance-benchmarks-in-the-wake-of-techempowers-web-framework-benchmark/)




## Resources




### Web page performance




  - [Ilya Grigorik: **Website Performance Optimization** (Udacity course)](https://www.udacity.com/course/ud884) \[1:13:57\] - 2014; Critical Rendering Path, optimizing content size, number requests, minimizing blocking elements. How to use Chrome dev tools' Timing and perf.testing on a mobile.
  - [Ilya Grigorik: High Performance Browser Networking](https://chimera.labs.oreilly.com/books/1230000000545) - free online book - Author Ilya Grigorik, a web performance engineer at Google, demonstrates performance optimization best practices for TCP, UDP, and TLS protocols, and explains unique wireless and mobile network optimization requirements. You’ll then dive into performance characteristics of technologies such as HTTP 2.0, client-side network scripting with XHR, real-time streaming with SSE and WebSocket, and P2P communication with WebRTC.
  - Google
      - [Speed requirements for mobile websites & tips](https://developers.google.com/speed/docs/insights/mobile) (Mobile Analysis in PageSpeed Insights)
      - [Optimizing the Critical Rendering Path](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/optimizing-critical-rendering-path) and [Analyzing Critical Rendering Path Performance](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/analyzing-crp#performance-patterns)




### Testing




#### Core




  - Facebook Engineering: [The Mature Optimization Handbook](https://m.facebook.com/notes/facebook-engineering/the-mature-optimization-handbook/10151784131623920) (or go directly to the [pdf](https://carlos.bueno.org/optimization/mature-optimization.pdf),   [ePub](https://m.facebook.com/l.php?u=http%3A%2F%2Fcarlos.bueno.org%2Foptimization%2Fmature-optimization.epub&h=hAQHRignh&s=1), [Mobi](https://m.facebook.com/l.php?u=http%3A%2F%2Fcarlos.bueno.org%2Foptimization%2Fmature-optimization.mobi&h=GAQFDKjj1&s=1)). If you get bored, jump directly to ch 5. Instrumentation.




### Performance Tips




##### HTTP Caching




  - [Google devs: Optimize caching](https://developers.google.com/speed/docs/best-practices/caching)
    Key tips: Set one "strong" (unconditional) caching header - C<span style="color:#222222;font-family:arial, sans-serif;font-size:12.800000190735px;font-style:normal;font-variant:normal;font-weight:normal;letter-spacing:normal;line-height:normal;orphans:auto;text-align:left;text-indent:0;text-transform:none;white-space:normal;widows:auto;word-spacing:0;background-color:#ffffff;display:inline !important;float:none;">ache-Control: max-age=N \[sec\]<span class="Apple-converted-space"> (or Expires) - and one "weak" (conditional, checked for updates) - ETag (fingerprint/hash) or Last-Modified. Set *Cache control: public* directive to enable caching by HTTP proxies (and HTTPS caching for Firefox) - but make sure it does not set any cookies as most proxies would not cache it anyway in that case. Notice that many proxies do not cache resources with query params.</span></span>
