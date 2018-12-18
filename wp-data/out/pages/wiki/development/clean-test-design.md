---
title: "Clean Test Design"
---
How to design your tests so that they are maintainable, valuable, long-live, and help you develop defect-less code?

**WORK IN PROGRESS**

## Stuff to include

* Split into (ref.: Cohen's Testing Pyramid)
  - focused [private|public unit tests](http://theholyjava.wordpress.com/2011/10/20/never-mix-public-and-private-unit-tests/ "Never Mix Public and Private Unit Tests! (Decoupling Tests from Implementation Details)")
    + test individual methods in isolation; focused, independent => can test more cases, more easily
  - module-level integration tests
    + test collaboration of few classes (real classes, no mocks) to verify they collaborate together as expected - verify that the methods tested in unit tests are actually used
  - end-to-end integration/functional tests
    + similar to the previous one but on a higher level; what we choose as our ends [depends on the risks invovled](http://theholyjava.wordpress.com/wiki/development/risk-based-testing/ "Risk-Based Testing")
  - acceptance tests
    + make sense to the business (though usually written by devs), can form the basis of a system of "living documentation)

Ref

* [How to Create Maintainable Acceptance Tests](http://theholyjava.wordpress.com/2012/01/18/how-to-create-maintainable-acceptance-tests/ "How to Create Maintainable Acceptance Tests")
* [Principles for Creating Maintainable and Evolvable Tests](http://theholyjava.wordpress.com/2011/11/21/principles-for-creating-maintainable-and-evolvable-tests/ "Principles for Creating Maintainable and Evolvable Tests")
* [Help, My Code Isn't Testable! Do I Need to Fix the Design?](http://theholyjava.wordpress.com/2012/09/09/help-my-code-isnt-testable-do-i-need-to-fix-the-design/ "Help, My Code Isn't Testable! Do I Need to Fix the Design?")
* [Do You Know Why You Are Testing?! (On The Principles Underlying TDD)](http://theholyjava.wordpress.com/2012/10/27/the-principles-underlying-test-driven-development-or-why-you-should-tdd/ "Permanent link to Do You Know Why You Are Testing?! (On The Principles Underlying TDD)")

Topics

* Mocks: Yes or not? (=> when yes?) - read Martin Fowler's [Mocks Aren't Stubs](http://martinfowler.com/articles/mocksArentStubs.html) that discusses mockist vs classical testing; quote (emphasis mine): "A classic test only cares about the final state - not how that state was derived. Mockist tests are thus _more coupled to the implementation_ of a method. Changing the nature of calls to collaborators usually cause a mockist test to break."
