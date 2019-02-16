---
title: "It will only take one hour... (On why programmers suck at estimating and the perils of software development)"
category: "SW development"
tags: ["productivity", "experience"]
---

"It will only take about an hour," I said to her. Two days later, a pull request awaits review. Where has all that time gone? What are the sources of delay in software development and how can we make it faster?

(_Published originally at the [Telia Engineering blog](http://engineering.telia.no/blog/it-will-only-take-1h)_)

## Our story

(_If you are in a hurry and not interested in the details, feel free to jump to [Obstacles and speed-ups](#obstacles-and-speed-ups)_)

The task was simple: instead of calling a middleware service directly from the browser client, we wanted to proxy the request through our backend application (which also talked to it already). After a quick search and review of a few StackOverflow posts, we had a draft of the solution within an hour. So far so good, but now the troubles came.

First we needed to figure out the URL of our new endpoint. That should be trivial, right? However this was a (normally) complex Spring Boot application so it took a few experiments to get right. I am still not sure where one part of the path comes from. And it also took a few iterations to find out what does the path information in the request look like (do we get the complete path? or are some prefixes removed from it?...) and to remove our local prefix(`/myapp/api/middleware-proxy`) so that only the middleware path would remain (more on that, sadly, later).

Next we needed how to obtain an authorization token, required to be allowed to talk to the middleware. We already had a `RestClient` class that handled retrieving this authorization automatically, so it was logical to reuse it - logical and wrong. We wasted about an hour trying to fit it for our purpose, until we gave up and re-implemented the authorization part ourselves within 15 minutes. Moreover this whole thing was actually "nice to have" but not necessary since the client already handled obtaining the token, as we eventually discovered. In effect it was thus a waste of time (given that our purpose wasn't to build the best solution but to find out whether it was at all feasible). At the root was a wrong assumption. I knew we needed to authorize with the middleware so I just went to implement it, without checking whether it really was necessary, without checking what the client did. It would have sufficed to look carefully at the headers the client was sending.

A major obstacle proved to be authorization between the client and our backend. All our controllers do that so we followed their lead. Later we discovered that the middleware did its own authorization so it might not have been necessary, though more security is always better :-). At least we correctly focused on getting it working in whatever way possible, postponing the consideration of what roles and permissions were needed to access what. Anyway it took a few hours to sort out because of two bugs/limitations in the authorization mechanism, which did not support our use case with a wildcard in the path mapping. After discovering these bugs/limitations and probing unsuccessfully for possible workarounds, we settled on the third, lowest-level authorization mechanism, which finally worked.

All was well and we were finally able to forward the request to the middleware - only to get back 404, which we confirmed after a while was indeed coming from the middleware and not our server. It took a while to discover that we made a typo while copying the RegExp removing our prefix from the request path. We fixed it and finally we were getting through (though getting just another error because of our test call lacked valid data, but it was at least reaching the target service). Time to clean up and refactor a little and then we were ready to integrated this into our frontend and try to proxy a real request. We were hopeful for a moment - until the only response we got back was `java.net.SocketException: Connection reset`. What the ...? Was something wrong with the VPN, proxy setting, ..? After 1-2 hours experimenting and fighting with the tools, we were able to extract the critical piece of code and run it separately to discover that we forgot to update and thus broke (again!) the RegExp during the refactoring. Why did the middleware load balancer shut down the connection instead of returning 404 as it did before I have no idea (well, the path was a little different this time, but still...).

So finally we were able to receive the request from the client, forward it to the middleware and get its response. Unfortunately, the only response that arrived to the client was `500 Internal Server Error - HttpMediaTypeNotAcceptableException: Could not find acceptable representation`. What the ... again? We got a string from the middleware, returned the string from our method, and copied the correct (as I have verified after some effort) middleware's `Content-Type` header, which matched the client's `Accept` header. So what was wrong and why was there any conversion involved? I did not ask for or want any! Few hours of debugging Spring internals and searching StackOverflow later, we arrived to marking our method with `produces=*/*` and registering the built-in `StringHttpMessageConverter` with Spring so that it was finally able to understand that we could produce what the client asked for and to convert the string we gave it into a string (that must not have been too difficult!).

A little cleanup and - two days later, and some 10 hours over the estimate - we were done. (But, of course, not done done; we still needed to review, merge, deploy, test, release, but let's be generous and not count that.)

(Sadly, this wasn't really the end of the story. A while later I discovered that one of the middleware services was returning `transfer-encoding: chunked`, which resulted in forever pending request in Chrome, `curl` at least gave me a cryptic error. 1-2 hours later I fixed the headers and all was well again...)

## Obstacles and speed-ups

This is certainly a nice war story to share and tell one's future grandchildren, but what is more interesting and relevant is looking at this in general and analysing the issues causing delay and the factors and tools that make the process slower or, by contrast, help us go faster.

Here, the main source of delay was the complexity of the system and the lack of familiarity both with the application and the framework it was built on (I am fairly new to this product). A secondary source of delays were unfounded assumptions (such as "we need to get an authorization token") and mistakes (first typo in and later forgetting to update the RegExp).

### Obstacles

A major source of delay and frustration during the development itself was that every change required us to compile and restart the server, which could take up to a few minutes, plus the time necessary to get to the point in the UI that triggered the action (which was especially annoying when our SSO cookie expired and we had to go through the multi-step, two-factor authentication process anew; imagine our desperation when the login service was temporarily down). When lucky, it could be just 30s, but you cannot be lucky always and, besides, even that is far too much for me. Perhaps [JRebel](https://zeroturnaround.com/software/jrebel/) could have helped us a lot here.

Unhelpful errors, especially from the middleware, produced both confusion and frustration. Sometimes we were even unsure about whether the error came from our framework/backend or from the middleware (which we later mitigated by adding a custom, developer-friendly header to error responses from the middleware).

Lack of transparency was a major obstacle. At start, when we tried to figure out the correct URL of our new endpoint, it would have been so much easier if the 404 error from the server included a list of all registered routes. The broken RegExp would be discovered much faster, if the middleware path was displayed when debugging and included in the error. Actually, I have now noticed that it was mentioned in the `Connection reset` error (kudos to the developer!) but I just did not see it. So even more importantly, we should have added an [`assert`](https://docs.oracle.com/javase/7/docs/technotes/guides/language/assert.html) to materialise our assumption that the RegExp continued to work and modified the path as expected. The `HttpMediaTypeNotAcceptableException` would likely have been easier to understand and solve if it included the list of the requested and producible media types and the available converters and what media types they supported together with a detailed explanation of the "Could not find acceptable representation" (this very same error is thrown from two distant and different places in the code).

### Speed-ups

Correct focus - not wasting time on (momentarily) unimportant details (such as roles and permissions), trying to get a "[Walking Skeleton](http://wiki.c2.com/?WalkingSkeleton)" or proof of concept of the functionality up and running.

The main tool we used was the debugger, enabling us to look at the actual data flowing through the system and see what was actually happening. It would have been even better if we were able to jump back in time (you cannot drill down into a piece of code once it has been executed, if you realise too late that you want to know what happened there), if it was even better at showing you the data without you having to ask for them (I had to add a "watch" to see the headers, so I wouldn't spot they already included what we needed unless I had a reason to look at them), and, most of all, if it was possible to change the code of the running application (i.e. correcting a problem as soon as we spot it so that we could quickly find the next one). (This is, incidentally, the main reason why I love Clojure - it enables me to change the running application and get instantaneous feedback, i.e. enables [interactive development](https://cider.readthedocs.io/en/latest/interactive_programming/). (Most of the time, it even [does away with the need for a debugger](http://blog.cognitect.com/blog/2017/6/5/repl-debugging-no-stacktrace-required).))

A useful sidekick was the Groovy Console integrated in my IDE, which enabled me to test quickly snippets of code (such as the RegExp) with access to all my application classes (well, after I figured out how to configure it correctly). A crucial limitation is that it runs in the context of the application's code but not in the context of the application itself, so I do not have access to the runtime configuration and objects and cannot thus easily invoke external systems etc., which limits the code I can try there. (The post [Java/Spring App Troubleshooting on Steroids with Clojure REPL](https://engineering.telia.no/blog/java-troubleshooting-on-steroids-with-clojure-repl) describes how we overcame some of this limitation.)

The ability to re-send a XHR request from the browser via its "XHR Replay" (or, if a change was necessary, "Copy as cURL") proved to be much more efficient then repeating the necessary (multi-step) UI actions to trigger our backend code.

Access to the framework code and JavaDoc together with StackOverflow were indispensable.

### What could we have done better

* Express and critically examine our unspoken assumptions
* Keep focused, only work on the next absolutely necessary step (and its minimal viable implementation)
* Apply more "[Debugging with the Scientific Method](https://github.com/stuarthalloway/presentations/wiki/Debugging-with-the-Scientific-Method)," i.e. not stepping blindly through the code but having a hypothesis and focusing on invalidating it.
* Enshrine our assumptions about (valid) data with Java asserts to discover unexpected deviations quickly

### What I would have wished for

Being able to apply interactive development, modifying the running application and getting immediate feedback. Having a developer-friendlier framework with clear and maximally helpful error messages (e.g. [Figwheel has a helpful, in-the-page error display](https://s3.amazonaws.com/bhauman-blog-images/figwheel-main/figwheel-main-demo-image.png) and [Elm is famous for its awesome errors](https://elm-lang.org/blog/compilers-as-assistants) that actually try to help the developer find a correction). Better manual testing conveniences in the application - no login required locally, not losing my place in the frontend application after a restart etc.

## Conclusion

Programming is difficult and there are always unforeseen complications. It is crucial to have the right mindset and approach (and focus). Good tools really matter a lot. Invest into "developer-friendliness," making issues easier to understand and faster to resolve and making (manual) testing easier. Beware accidental complexity and [invest into making your systems "simple"](https://www.infoq.com/presentations/Simple-Made-Easy).
