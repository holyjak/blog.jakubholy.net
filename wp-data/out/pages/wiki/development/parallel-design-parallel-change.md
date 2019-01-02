---
title: "Parallel Change (Parallel Design)"
---
Parallel design means that when changing a design, you keep the old design as long as possible while gradually adding the new one and then you gradually switching to the new design. Only after that you gradually remove all the old code.

This applies both at large and also (surprisingly) small scale. Though it costs you more – you have to figure out how to have them both run and it requires more effort to have them both – it often pays off because it’s safer and it enables resumable refactoring.

An example of a high-level parallel design is the replacement of a RDBMS with a NoSQL database. You’d start by implementing the code for writing into the new DB, then you would use it and write both to the old and the new one, then you would start also reading from the new one (perhaps comparing the results to the old code to verify their correctness) while still using the old DB’s data. Next you would start actually using the NoSQL DB’s data, while still writing to/reading from the old DB (so that you could easily switch back). Only when the new DB proves itself would you gradually remove the old DB.


An example of a micro-level parallel design is the replacement of method parameters (message etc.) with the object they come from (an Edge), as [we did for notifyComment](https://github.com/iterate/codecamp2012/commit/cc04f0bb60d8260456049790793d462ce8810ef2#diff-1):




    - public void notifyComment(String message, String eventName, String user) {
    -    notifications.add(user + ": commented on " + eventName + " " + message);
    ---
    + public void notifyComment(Edge target) {
    +    notifications.add(target.getTo().getId() + ": commented on " + target.getFrom().getId() + " " + target.get("comment"));



The steps were:


1.  Adding the Edge as another parameter (Refactor – Change Method Signature)
2.  Replacing one by one usages of the original parameters with properties of the target Edge (Infinitest running tests automatically after each change to verify we’re still good)
3.  Finally removing all the original parameters (Refactor – Change Method Signature)



The good thing is that your code always works and you can commit or stop at any time.

For an example, see my blog post [Demonstration: Applying the Parallel Change technique to change code in small, safe steps](/2017/02/03/demonstration-applying-the-parallel-change-technique-to-change-code-in-small-safe-steps/).


## Related



Parallel Design enables **Resumable Refactoring** - the code is always buildable and you are able to stop in the middle of the refactoring and continue (or not) at any later time.


## Note regarding the name



My mentor called this Parallel Design but I prefer the name Parallel Change used on Martin Fowler's site by D. Sato since Parallel Design is also used in Lean for the practice of developing multiple solutions to the same problem in parallel to ensure that a hard deadline is not missed - typically a quick but suboptimal and a more time-consuming but better one.


## References




  - [ParallelChange](http://martinfowler.com/bliki/ParallelChange.html) at MartinFowler.com by D. Sato - break the change into expand, migrate, and contract; nice examples and useful links
  - [Joshua Kerievsky's talk The Limited Red Society](http://www.infoq.com/presentations/The-Limited-Red-Society) - the author argues for keeping periods when code doesn't compile or tests fail to minimum and shows examples of Big Leap and Parallel Change (referred to as Paralle Design here) strategies; highly recommended
  - [Summary of Kent Beck's talk Best Practices for Software Design with Low Feature Latency and High Throughput](/2012/03/12/kent-beck-best-practices-for-software-design-with-low-feature-latency-and-high-throughput/)
  - Kent Beck's presentation [Effective Design](http://www.slideshare.net/deimos/kent-beck-effective-design) (slides 8 and 9)
  - [The Succession entry in Kent Beck's Software Design Glossary](https://www.facebook.com/notes/facebook-engineering/software-design-glossary/10150309412413920) - "\[..\] *Succession* is the art of taking a single conceptual change, breaking it into safe steps, and then finding an order for those steps that optimizes safety, feedback, and efficiency. \[..\]"
  - Dan Milstein: [How To Survive a Ground-Up Rewrite Without Losing Your Sanity](http://onstartups.com/tabid/3339/bid/97052/Screw-You-Joel-Spolsky-We-re-Rewriting-It-From-Scratch.aspx) - quotes: "Over my career, I've come to place a really strong value on figuring out how to break big changes into small, safe, value-generating pieces." And: "Here's what I'm going to say: always insert that dual-write layer. *Always*. It's a minor, generally somewhat fixed cost that buys you an incredible amount of insurance. It allows you, as we did above, to gradually switch over from one system to another. It allows you to back out at any time if you discover major problems with the way the data was migrated (which you will, over and over again). It means your migration of data can take a week, and that's not a problem, because you don't have to freeze writes to *both* systems during that time. And, as a bonus, it surfaces a bunch of those weird situations where "other" systems are writing directly to your old database."
