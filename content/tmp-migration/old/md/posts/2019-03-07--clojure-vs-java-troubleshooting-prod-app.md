---
title: "Clojure vs Java: Troubleshooting an application in production"
category: "SW development"
tags: [clojure, java, experience, clojure-vs-java]
---

I have just gone through the painful experience of troubleshooting a remote Java webapp in a production-like environment and longed for Clojure's explore-and-edit-running-app REPL. I want to demonstrate and contrast the tools the two languages offer for this case.

<!--more-->

(_Published originally at the [Telia Engineering blog](https://engineering.telia.no/blog/clojure-vs-java-troubleshooting-prod-app)._)

_NOTE: I use Java and Groovy interchangeably because they are fundamentally the same; what I say about the one applies also ± to the other._

## The problem

I have written a new controller that modifies slightly the incoming requests and sends it further to another service, returning its result. It worked just fine locally but failed with 400 Bad Request in our test environment in the cloud. Thus I needed to get more insight into what was happening in the application to find out what the crucial difference between local and remote was.

## Troubleshooting in Java

The ultimate troubleshooting tool in Java is the debugger. Remote debugging requires that you can access the debuggers port directly or via SSH and that the application is actually running in debug mode.

The Java HotSpot VM uses "full-speed debugging". But it isn't really full speed as some optimizations are reportedly impossible in debug mode. [One source](https://stackoverflow.com/a/6491108/204205) claims that the overhead of running in debug mode about 5% while an old [AMD report found performance between 17% and 100%](https://web.archive.org/web/20160316201129/https://developer.amd.com/resources/documentation-articles/articles-whitepapers/java-performance-when-debugging-is-enabled/) (2010, JDK6).

For our purposes running in the debug mode (or making it possible to switch over to it) would likely be just fine, especially given this is a test environment, not production. In prod we might be more hesitant to incur any overhead. And if you do then you run under slightly different conditions in test and prod, opening a window for weird and likely rare issues to slip through undetected. (I guess it is mainly a cost-benefit-security consideration.)

A debugger has one big limitation compared to Clojure REPL - its ability to change the code is fairly limited.

Truth be told, I have not used the debugger because our application and infrastructure is not configured for it. Running in Docker on Kubernetes, it is not so easy (for me) to change its startup arguments to enable debug mode.

So I did the next best thing - added some `println` to log the incoming and outgoing headers and bodies and prayed that it would provide enough information to understand the cause of the problem. Luckily, it did - the `Authorization:` header we were adding contained an error HTML instead of a valid token, indicating that there were both problems reaching the authorization service and our handing of its non-OK responses.

So I changed the code, committed (I did not actually want this on `master` but anything else was too complicated), waited 20 min (I know, that is extreme) for our build to finish and publish a new Docker image that I could deploy. That is a terribly slow feedback loop.

## Troubleshooting in Clojure

The primary tool in [Clojure is the REPL](https://clojure.org/guides/repl/introduction). It is the coding terminal connected to your codebase and your running application, making it possible to explore the application state, run code in its context, and evolve the application (while it is running and without losing any state). This is what you use both to develop your application and to troubleshoot it.

To be able to connect the REPL to your application, you need either be able to reach a port as with the debugger or use [REPL-over-HTTP](https://devcenter.heroku.com/articles/debugging-clojure).

To "debug" your application, you can use your [brainpower and binary search][Stu1], [instrument the code][Cambium], or, in rare cases, use an actual [Clojure-aware debugger][CDT+Co]. [Puppet developers advise][Puppet]:

>  The Clojure REPL is often the most useful tool, as it makes it very easy to interact with individual functions and namespaces.
>
> If you are looking for more traditional debugging capabilities, such as defining breakpoints and stepping through the lines of your source code, there are many options. Just about any Java debugging tool will work to some degree, but Clojure-specific tools such as [CDT][CDT+Co] and [debug-repl][CDT+Co] will have better integration with your Clojure source files.
>
> For a more full-featured IDE, Cursive is a great option. It’s built on IntelliJ IDEA, and provides a debug REPL that supports all of the same debugging features that are available in Java.

So how would I proceeded if this was a Clojure application?

I would create an atom (a "global variable") and modify the request handler function to store the incoming and outgoing requests there. Then I would trigger the failing request from the browser and go back to the REPL to look at the requests. I would fix the code - both locally and in the running app - and, directly from the REPL, run the request through the function(s) again. Rinse and repeat until fixed. (Remembering to commit and deploy your changes at the end :-)).

As you can see, the feedback loop here is about instantaneous.

### Objection: Changing code in remote/prod app is a terrible risk

Yes, it is. With power comes responsibility. If you have rogue developers on your team that do whatever comes into their mind, I would strongly discourage you from allowing them to access prod REPL. On the other hand:

> [..] the most interesting story I've heard about a REPL in prod was the following - Debugging a program running on a $100M piece of hardware that is 100 million miles away is an interesting experience. Having a read-eval-print loop running on the spacecraft proved invaluable in finding and fixing the problem. [Lisping at JPL](http://www.flownet.com/gat/jpl-lisp.html)

You are not NASA but neither are you a programmer kindergarten, I suppose. Make your call.

(See also [Clojureverse: REPLS on production deployments](https://clojureverse.org/t/repls-on-production-deployments/3476) and [Jay Fields: Clojure production web REPL](http://blog.jayfields.com/2012/06/clojure-production-web-repl.html).)

## Conclusion

For me, effective development is all about quick feedback loops. With Clojure REPL I can both troubleshoot a problem and explore how to fix it at the same time, with instantaneous feedback - whether the application is local or remote. Java, even with a debugger, requires long cycles resulting in frustration and inefficiency.

_Disclaimer:_ I do not intend to participate in a flame war or bash Java. My intention is to demonstrate, on concrete examples, the strengths of Clojure I value. Your values and needs might differ and thus Java might be the perfect solution for _you_. I don't mind that :-).

## Resources

* [Cambium - The Power of Clojure: Debugging][Cambium] by Ian Truslove (2018) - in depth guide on REPL-based debugging in Clojure, both with and without extra tools, with great links
* [REPL Debugging: No Stacktrace Required][Stu1] (2017) by Stuart Halloway - how to use the REPL to effectively locate a problem
* [Puppet Server: Debugging][Puppet] - a brief overview of the tools

[Stu1]: http://blog.cognitect.com/blog/2017/6/5/repl-debugging-no-stacktrace-required
[Cambium]: https://cambium.consulting/articles/2018/2/8/the-power-of-clojure-debugging
[Puppet]: https://puppet.com/docs/puppetserver/6.2/dev_debugging.html
[CDT+Co]: http://georgejahad.com/clojure/cdt.html

## More from this series

1. [Solution design in Java/OOP vs. Clojure/FP - I/O anywhere or at the boundaries? - experience](design-in-java-vs-fp/)
2. [Clojure vs Java: The benefit of Few Data Structures, Many Functions over Many Unique Classes](clojure-vs-java-few-datastructures-over-many-objects/)
3. [Clojure vs Java: Troubleshooting an application in production](clojure-vs-java-troubleshooting-prod-app/)
