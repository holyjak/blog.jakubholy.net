---
title: "Risk-Based Testing"
---
The resources we have for testing are always limited and we can never test all the combinations and interactions in our software. Therefore we have to choose where to focus our testing efforts.

The Pareto rule applies also to software defects <sup>citation needed</sup>, i.e. it has been observed that 80% of defects is caused by 20% of the code. Therefore **we should focus our testing on those parts of the code where the risk (and severity) of defects is highest** to use our limited resources to minimize the risk as much as possible. Where defects are most likely to occur must be considered individually for each case, it could be the integration part, business logic, occasionally UI or interactions throughout the whole application.

Another factor to consider is that **testing is the easier and cheaper the closer it is to the possible source of defects**. (As represented by Mike Cohn's [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html).) It is much simpler to test thoroughly a single layer of an application (and even more so for a single class) than to write full integration tests extercising it end to end. (The level of complexity is lower - you need set up less things, there is much less possible interactions, it is much easier to reason about the code and to detect the cause of a failure.) Therefore we want our tests as focused around the most risky part of our code as possible.

Evaluating where the risk is located and how it is distributed through the application helps us decide how much we can focus our tests and where to focus them. We need of course to test also the rest of the application but if 20% of the code causes 80% defects than 80% of our "testing budget" should go there.

This is an application of the [Economics of Coding](/wiki/development/economics-of-coding/) regarding the cost and benefits of tests and the available resources.

## See Also

  - [How to Create Maintainable Acceptance Tests](/2012/01/18/how-to-create-maintainable-acceptance-tests/)
