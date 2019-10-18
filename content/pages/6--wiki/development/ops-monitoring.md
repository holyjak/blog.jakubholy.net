---
title: "Ops: Monitoring"
---
(*Work in progress.*)

Tools and practices for monitoring systems and applications, especially in the cloud and JVM-based environments.

## Learn about monitoring

* DigitalOcean's [Monitoring for Distributed and Microservices Deployments](https://www.digitalocean.com/community/tutorials/monitoring-for-distributed-and-microservices-deployments)

## Monitoring needs

1.  Metric collection - collection of metrics from different machines, servers, services, perhaps diff. monitoring systems
2.  Metric aggregation - avg/min/max/std.dev etc. over a configurable period of time
      - ability to compare with corresponding previous period(s) (prev. week, year, ...), derivation of a "baseline" to make it easy to spot deviations from the normal behavior
3.  Alerting and notifications - alert when a metric exceeds a limit, ... (preferably reasonable default + scriptable advanced conditions; scriptable alert actions, notifications via e-mail and other channels, ...)
4.  Eventing - ability to correlate metrics with system events such as a DB upgrade
5.  Other
      - UI, dashboard (configurable display of metrics, graphs, combined graphs, alerts)
      - API (preferably REST, JSON)
      - Extensibility

### Some criteria

  - Number of supported platforms, servers (DB, AS, cache, ...)
  - Support for JavaEE-specific software (Tomcat threadpools, JDBC etc.)
  - Support for JMX to easily monitor anything Java-based
  - Extensability: Define custom metrics/aggregations, fetch the collected data, ...

## Recommended metrics

From [Release It\!](https://pragprog.com/book/mnee/release-it), p.268-9

  - **Memory**: Minimum heap size, maximum heap size, generation sizes
  - **Garbage collection**: Type, frequency, memory reclaimed, size of request
  - **Worker threads, for each thread pool**: Number of threads, threads busy, threads busy more than 5s, high-water mark (max concurrent threads in use), low-water mark, number of times a thread was not available, request backlog
  - **DB connection pools, for each pool**: Number of connections, connections in use, high-water mar, low-water mark, number of times a connection wasn't available, request backlog
    ****
  - **Traffic statistics, for each request channel**: Total requests processed, average response time, requests aborted, requests per second, time of last request, accepting traffic or not
  - **Business transactions, for each type**: Number processed, number aborted, dollar value, transaction aging, conversion rate, completion rate
  - **Users**: Demographics or classification, technographics, percentage of users who are registered, number of users, usage patterns, errors encountered
  - **Integration points** (external web services, DB, ...): Current state, manual override applied, number of times used, average response time from remote system, number of failures
  - **Circuit breakers**: Current state, manual override applied, number of failed calls, time of last successful call, number of state transitions
  - **App metrics** - depending on the app in question

### State dashboard

Summarising current state on a dashboard, as recommended in Release It\!:

  - Green - all of the following must be true:
      - All expected events have occurred (batch jobs finished successfully, ...)
      - No abnormal events have occurred
      - All metrics are nominal (= mean ± 2\*std.dev.)
      - All states are fully operational (no circuit breaker opened etc.)
  - Yellow - at least one of the following is true:
      - An expected event has not occurred
      - At least one abnormal event, with a medium severity, has occurred
      - One or more parameters is above or below nominal
      - A noncritical state is not fully operational (f.ex., a circuit breaker has cut off a noncritical feature)
  - Red - at least one of the following is true:
      - A required event has not occurred
      - At least one abnormal event, with a high severity, has occurred
      - One or more parameters is far above or below nominal
      - A critical state is not at its expected value (f.ex., "accepting requests" is false when it should be true)

Notice that "nominal values" are typically based on the same day and hour of the previous week (unless it is a special season such as Black Friday sale etc. where it make more sense to compare to the previous year).

## The trouble with aggregating metrics

Aggregating metrics (with the exception of the primitive ones such as counters) is not as simple as it may appear and you need to take care that the aggregation actually makes sense with respect to statistics. See e.g. [Why Percentiles Don’t Work the Way you Think](https://www.vividcortex.com/blog/why-percentiles-dont-work-the-way-you-think).

## Tools

### My experiences & plans

I have used **Grafana** 3 and **InfluxDB** 0.12.

#### Time Series Database: InfluxDB

I have picked InfluxDB over Graphite because:

1.  It was a single Go binary and thus simpler to deploy and manage
2.  It was newer and seemed better designed (sorry, I do not have more details anymore)

It works OK for what I need.

##### Limitations:

Its query language is reportedly limited compared to Graphite.

My main issue is that I collect data from multiple nodes (that report in different times) and thus need to somehow first aggregate the data for a node and then to aggregate it over time. That would be easy with a nested query but is impossible with InfluxDB. (I could create new, aggregated metrics instead of the subquery with the Continuous Queries - but I would need to manually create a query for each metric (+ increasing the storage needs). For example I want to know how many nodes are up at any given time and each node reports the count of 1 every minute. I must make sure to take exactly one value from each node series.  So I need: SELECT sum(\*) FROM (SELECT latest("is\_node\_up") ... GROUP BY node) GROUP BY time(1m). (A description of [a similar challenge](https://github.com/grafana/grafana/issues/5429).)

It only supports clustering and high availability in its commercial version.

#### Alternatives to InfluxDB:

See this reportedly good comparison of 8/2016: [Top10 Time Series Databases](https://blog.dataloop.io/top10-open-source-time-series-databases): it rates DalmatinerDB (using ZFS, Riak Core) as \#1 unless your data fits into one node - then InfluxDB wins. Nr. 3 is Prometheus - even though it isn't (only) a time series DB but a monitoring system.

According to [this HN discussion](https://news.ycombinator.com/item?id=12453192) (9/2016), there is:

  - [Cyanite](http://cyanite.io/) - it speaks the various Graphite protocols and feeds data into Cassandra, which takes care of the HA concerns. (JH: Though I believe that operating Cassandra isn't trivial). A commenter: "Currently, we are running several nodes of Riemann/Cyanite/Cassandra. It works very well, integration is pretty straight forward."
  - ScyllaDB for Cassandra
  - Prometheus
  - ...

#### Anomaly detection and alerting

[Morgoth](https://github.com/nathanielc/morgoth) looks as a useful tool for metric anomaly detection.

### Links to other tools of interest

  - [Prometheus](https://prometheus.io/) - Cloud Native project, a popular monitoring solution
    - [Thanos](https://github.com/thanos-io/thanos) - Cloud Native sandbox project providing "a highly available metric system with unlimited storage capacity" on top of Prometheus instances
    - [Cortex](https://github.com/cortexproject/cortex) - fills in the gaps of Prometheus to provide a full Prometheus-as-a-Service platform - adds multi-tenancy, authentication and authorization, long-term storage (using DynamoDB / S3 / Cassandra / Bigtable / ...).
  - [Bosun](http://bosun.org/) "*is an open-source, MIT licensed, monitoring and alerting system by Stack Exchange. It has an expressive domain specific language for evaluating alerts and creating detailed notifications. It also lets you test your alerts against history for a faster development experience.*" (in Go)
  - [Hyperic HQ](http://www.springsource.com/landing/hyperic-open-source-download), open-source & enterprise ed., see [my intro](theholyjava.wordpress.com/2011/10/17/monitoring-java-webapp-with-hyperic-hq-send-email-when-too-many-errors-in-logs/)
  - [Zenoss](http://community.zenoss.org/index.jspa), open-source & enterprise ed.
  - [Nagios](http://www.nagios.org/), open-source and ?, seems to be pretty popular
  - [Ganglia](http://ganglia.sourceforge.net/) ([quick start](https://sourceforge.net/apps/trac/ganglia/wiki/ganglia_quick_start)), open-source, primarily targets Linux. Uses XML, XRD, RRD, web frontend in PHP, described as "a scalable distributed monitoring system for high-performance computing systems such as clusters and Grids". Extensible via C/Python.
  - Zabbix, open-source; general; compared to Hyperic: reasonable UI with custom dashboards, custom actions; quite flexible. We had regularly performance problems with its DB, the UI is old fashioned. It requires lot of clicking but fortunately has an API.
  - ...

Enterprise and SaaS solutions

  - NewRelic - popular, provides a rather high-level view
  - [AppDynamics](http://www.appdynamics.com/) - focus on business transactions and end-to-end view with drill-down
  - [Splunk Enterprise](http://www.splunk.com/view/splunk/SP-CAAAG57) -

## Libraries

Metrics

  - [Netflix Servo](https://github.com/Netflix/servo/wiki) - for collecting and publishing metrics from a java app (to a file, CloudWatch, in-memory sample). Exposes metrics (annotated fields) automatically over JMX. [See this example](https://github.com/Netflix/servo/blob/master/servo-example/src/main/java/com/netflix/servo/example/BaseHandler.java). Essentially you either create different monitor objects or annotate fields, make sure they are updated as needed, register their owner with a registry, and run a poller that takes samples and publishes them. Computes [various stats](https://github.com/Netflix/servo/blob/master/servo-core/src/main/java/com/netflix/servo/stats/StatsBuffer.java), supports [publishing to graphite](https://github.com/Netflix/servo/wiki/Publishing-to-Graphite). Supports various metrics: informational (a string?), counter, gauge, ... . A nice thing is the [AsyncMetricObserver](https://github.com/Netflix/servo/blob/master/servo-core/src/main/java/com/netflix/servo/publish/AsyncMetricObserver.java) (update calls return immediatelly).
  - [JavaMelody](http://code.google.com/p/javamelody/) - "monitor Java or Java EE application servers in QA and production environments," targetted primarily at web/app servers, built-in charting. A proxy for monitoring of JDBC Drivers, EJBM interceptor, Spring support (=\> make a method monitored with an annotation). servlet filter. Data stored in .rdd files locally or sent to a central server. There is a [short & nice presentation](http://www.slideshare.net/djkarlsen/significance-of-metrics) at SlideShare.
  - [Java Simon](http://code.google.com/p/javasimon/) - Simple Monitoring API  (JAMon replacement) - record start and stop named events using the Simon API, Simon will compute metrics such as min/max/avg/std.dev/count/... . The events may be hierarchical (e.g. web call -\> db call). Support for capturing snapshots (samples) of the metrics, monitoring Java EE (DB Driver wrapper, monitoring servlet Filter, interceptors). Web console to monitor the metrics. Exposed over JMX.
  - [Yammer's Metrics](http://metrics.codahale.com/) for instrumenting JVM-based services. Can report to e.g. Ganglia and Graphite. Support e.g. for Guice, Jetty, Jersey, Log4j, Apache HttpClient, Ehcache, Logback, Spring. Manual usage: create a metric (gauge, counter, meter (rate), histogram (min/max/std.dev./percentiles), timer (-\> rate, duration distribution)) and keep on updating it manually. Each metric is bound to a class (-\> package hierarchy). Access the metrics via JMX or via HTTP as JSON or send them to a stdout/csv file/ganglie/graphite. Support for custom HealtCheck:s. The AdminServlet serves the JSON metrics, may run health checks, print a thread dump, provide a simple ping response to load balancers (all of these are also available separately). [Scala support](http://metrics.codahale.com/manual/scala/), metrics [servlet Filter](http://metrics.codahale.com/manual/webapps/), ... . [Annotations](http://metrics.codahale.com/maven/apidocs/com/yammer/metrics/annotation/package-frame.html) for measuring methods of Guice/Jersey/... managed ojbects. [JavaDoc](http://metrics.codahale.com/maven/apidocs/index.html).

Related

  - [Graphite](http://graphite.readthedocs.org/en/0.9.10/overview.html) - "an enterprise-scale monitoring tool that runs well on cheap hardware". A popular tool for visualizing time-series data (it receives data, stores them in a RDD-type db, and shows them in a web UI). Configurable graphs, [dashboards](http://graphite.readthedocs.org/en/0.9.10/dashboard.html) etc. Written n Python.
  - [JRDS](http://jrds.fr/) - "Jrds is performance collector, much like cacti or munins. But it intends to be more easy to use and able to collect a high number of machines in a very short time. It's fully written in java and avoid call external process to increase performances. It uses [RRD4J](http://code.google.com/p/rrd4j/ "http://code.google.com/p/rrd4j/"), a clone of [rrdtool](http://oss.oetiker.ch/rrdtool/ "http://oss.oetiker.ch/rrdtool/") written in java."
  - [Rocksteady](http://code.google.com/p/rocksteady/) + [Esper](http://esper.codehaus.org/): Rocksteady is a java app that reads metrics from RabbitMQ, parse them and turn them into events so Esper (CEP) can query against those metric and react to events match by the query.
  - [Jolokia is remote JMX with JSON over HTTP](http://www.jolokia.org/): a REST API bridged to JMX, with support for security, fine-grained access control, bulk operations. Especially useful if you either 1)  need to perform bulk operations (e.g. get multiple values) or 2) want to access them from something that doesn't support JMX. JSON is in general very easy to use and navigate. You can install Jolokia as a WAR (or mebedd its Servlet), a JVM agent, or attach it on-the-fly to a running JVM.

Logs

  - [LogStash](http://logstash.net/) - a popular tool that can collect (directly/via \[distributed\] syslog), parse (=\> extract timestamp etc), and store logs - support for indexing storing in ElasticSearch for searching, parses e.g. Apache logs out of the box. See this [Logstash slides](http://semicomplete.com/presentations/logstash-puppetconf-2012/#/7) (9/2012).
      - Can also [send metrics to statsD](http://cookbook.logstash.net/recipes/statsd-metrics/) / Graphite
  - [Kibana](http://kibana.org/infrastructure.html) - a web interface to seach logs from LogStash, view them in realtime (based on a query) etc. See the overview of [Kibana’s powers](/2013/08/31/most-interesting-links-of-august-13/kibana.org/about.html).

Other

  - [hawtio web console](http://hawt.io/) - a lightweight and modular HTML5 web console with [lots of plugins](http://hawt.io/plugins/index.html) for managing your Java stuff - to be embedded into standalone apps or containers such as Jetty/Tomcat - view metrics, manage, ... (using JMX under the cover)
