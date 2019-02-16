---
title: "Code Quality"
---
<div style="background-color:lightgrey;font-weight:bold;padding:10px;margin-bottom:10px;">

THIS IS ONLY A DRAFT

</div>

# Code (And Design) Quality And Why Should We Care

> A traveller meets a woodcutter cutting trees with a blunt axe and asks: "Why don't you sharpen your axe?"
> Woodcutter: "I've no time for that, I must cut trees\!" (unknown origin)

## Why: No Sustainable Development Speed Without Code Quality

// poppend., graph time-speed-debt
// cost of new devel. vs. cost of maintenance
// Via - lost time due to quality

## What Is Code Quality?

\- tests
\- clean code values (impl. patt. KB): communication, simplicity, flexibility
\- guiding principles (Kent): locality of change etc.
\- principles: SRP, SoC, KISS, DRY
\=\> small methods on the same level of abstraction, intention-revealing name and organization, ...
\- cleanliness maintenance during dev.: as cooks that end up with totally dirty and thrashed kitchen x those ending up with a clean one ready for further cooking
\- structure and abstractness level: code as a journalist - the pyramid structure of an article (incr. level of detail and amount of content)

## Pragmatic Code Quality

What, when is "good enough"?
\- always can be increased; economics: cost x benefit

## The Challenges of Legacy (Unclean) Code

### Hard to understand

#### Mixed business and implementation concerns

From the code alone you can see what happens but not why this behavior is there. A business requirement may be implemented in multiple ways. If the code isn't well structured then you cannot distinguish which part is there as an essential consequence of the requirement and which part is there just because of the particular implementation way chosen. Thus "the code is the documentation" really fails here.

### Hard to change consistently

#### Duplication

When you need to modify - e.g. fix - a piece of duplicated (due to copy\&paste\[\&modify\] etc.) logic, you usually need to modify also the other duplicates. This is easy to forget (especially because the code is hard to understand), leading to only partially fixed defects and inconsistencies.

## Refs

\- blog Kb 4 design rules
\-

## Testing

Testing is a key practice enabling clean code.

Local testing-related posts:

  - [Do You Know Why You Are Testing?\! (On The Principles Underlying TDD)](/2012/10/27/the-principles-underlying-test-driven-development-or-why-you-should-tdd/)
  - [Clean Test Design](/wiki/development/clean-test-design/)
  - [Principles for Creating Maintainable and Evolvable Tests](/2011/11/21/principles-for-creating-maintainable-and-evolvable-tests/)
  - [Never Mix Public and Private Unit Tests\! (Decoupling Tests from Implementation Details)](/2011/10/20/never-mix-public-and-private-unit-tests/)

(Presumabely) good books about testing (though, according to Kent Beck as of 11/2012, "Really, the right book has yet to be written."):

  - S. Freeman, N. Pryce: [Growing Object-Oriented Software Guided by Tests](https://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627/) (9/2009)
  - Kent Beck: [Test Ddriven Development By Example](https://amzn.com/0321146530) (11/2002) - especially the part that covers the workflow of TDD
  - Roy Osherove: [The Art of Unit Testing: With Examples in .Net](https://www.amazon.com/Art-Unit-Testing-Examples-Net/dp/1933988274) (7/2009)

## Resources

  - [Martin Fowler: The Value of Software Design](https://youtu.be/8kotnF6hfd8?t=45m) (talk, 22 min, from 0:45:00 til 1:07; Feb 2013) - a balanced argument for the value of good software design and internal code quality based on paying off by enabling us to keep our development speed. Discusses the [DesignStaminaHypothesis](https://martinfowler.com/bliki/DesignStaminaHypothesis.html) (bad design =\> rapid decline of development speed), [TechnicalDebt](https://martinfowler.com/bliki/TechnicalDebt.html), [TechnicalDebtQuadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html) (Prudent x Reckless, Deliberate x Inadvertent), [TradableQualityHypothesis](https://martinfowler.com/bliki/TradableQualityHypothesis.html). According to the experience of Fowler and others, the good design payoff point "it's weeks, not months."
  - [Opportunistic Refactoring](https://java.dzone.com/articles/opportunistic-refactoring) by Martin Fowler – refactor on the go – how & why
  - Michael Feathers: [Getting Empirical about Refactoring](https://www.stickyminds.com/s.asp?F=S16679_COL_2) – gather information that helps us understand the impact of our refactoring decisions using data from a SCM, namely File Churn (frequency of changes, i.e. commits) vs. Complexity – files with both high really need refactoring. Summary: “*If we refactor as we make changes to our code, we end up working in progressively better code. Sometimes, however, it’s nice to take a high-level view of a code base so that we can discover where the dragons are. I’ve been finding that this churn-vs.-complexity view helps me find good refactoring candidates and also gives me a good snapshot view of the design, commit, and refactoring styles of a team.*“
  - Jason Gorman: [Refuctoring](https://www.waterfall2006.com/gorman.html) - the art of securing your position by making your code incomprehensible by anyone else ([see it done in practice](https://www.youtube.com/watch?v=7RJmoCWx4cE))
  - [Principles for Creating Maintainable and Evolvable Tests](/2011/11/21/principles-for-creating-maintainable-and-evolvable-tests/) - naming, proper level of abstraction
  - [CodingHorror: Coding Without Comments](https://www.codinghorror.com/blog/2008/07/coding-without-comments.html) (2008) - a very good explanation if how to treat comments (similar what Clean Code says): write code so that it is self-explanatory (using good method and variable names), if necessary, add comments that explain why (while the code shows what/how).
  - [The other kind of software debt - competency debt](https://www.leanway.no/competence-debt/)

Some quotes:

> I like my tests to by very simple examples of what the production code does. I don’t like it when I have to think about what the tests mean…
>
> *- Matteo Vaccari in a [post about Kent Beck’s Simplification strategy](https://matteo.vaccari.name/blog/archives/770)*

> Any fool can write code that a computer can understand. Good programmers write code that humans can understand.
>
> \- *Martin Fowler*
