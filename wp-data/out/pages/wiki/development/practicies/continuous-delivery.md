---
title: "Continuous Delivery"
---
## Resources

* [Jez Humble: The Case for Continuous Delivery](http://www.thoughtworks.com/insights/blog/case-continuous-delivery) (2/2014) - read to persuade manager about CD: "Still, many managers and executives remain unconvinced as to the benefits [of CD], and would like to know more about the economic drivers behind CD." CD reduces waste: "[..]online controlled experiments (A/B tests) at Amazon. This approach created hundreds of millions of dollars of value[..]," reduces risks: "[..] Etsy, has a great [presentation](http://www.usievents.com/en/conferences/8-paris-usi-2011/sessions/968-john-allspaw) which describes how deploying more frequently improves the stability of web services." CD makes development cheaper by reducing the cost of non-value-adding activities such as integration and testing. F.ex. HP got dev. costs down by 40%, dev cost/program by 78%

## Notes

### Why continuous delivery practices?

* Everybody develops on the same branch to prevent integration/merge hell and unexpected issues when a merge "succeeds" but causes unexpected side effects (reviving previously removed configuration etc.) - use feature toggles,[parallel change](http://theholyjava.wordpress.com/wiki/development/parallel-design-parallel-change/ "Parallel Design (Parallel Change)"), etc. to make this possible
