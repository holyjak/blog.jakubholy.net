---
title: "Code Conventions (Java)"
---
## Structure

### Guard clauses (a.k.a. guard statements, guard conditions)

([Introduced by M. Fowler in Refactoring](https://www.refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html))

Instead of nested if-else, have (a number of) if (condition not satisfied) { return / throw }; at the start of the method to handle exceptional flows and then continue with the main flow. This improves readability. Example by Fowler:

>
>
>     double getPayAmount() {
>       if (_isDead) return deadAmount();
>       if (_isSeparated) return separatedAmount();
>       if (_isRetired) return retiredAmount();
>       return normalPayAmount();
>     };

#### What about the single point of entry and exit guideline?

The question [Should a function have only one return statement?](https://stackoverflow.com/questions/36707/should-a-function-have-only-one-return-statement) at StackOverflow has some really good answers and comments, let me steal and present some of them.

According to [Chris S. at SO](https://stackoverflow.com/a/733858/3309863),  [Code Complete](https://www.cc2e.com/) recommends:

> **17.1 return**
>
> **Minimize the number of returns in each routine**. It's harder to understand a routine if, reading it at the bottom, you're unaware of the possibility that it \*return\*ed somewhere above.
>
> **Use a *return* when it enhances readability**. In certain routines, once you know the answer, you want to return it to the calling routine immediately. If the routine is defined in such a way that it doesn't require any cleanup, not returning immediately means that you have to write more code.

Also Kent Beck in  [Implementation Patterns](https://rads.stackoverflow.com/amzn/click/0321413091) says that single entry/exit is a historical relic that is unnecessarily strict nowadays, according to [blank at SO](https://stackoverflow.com/a/36732/3309863):

> "was to prevent the confusion possible when jumping into and out of many locations in the same routine. It made good sense when applied to FORTRAN or assembly language programs written with lots of global data where even understanding which statements were executed was hard work ... with small methods and mostly local data, it is needlessly conservative."
