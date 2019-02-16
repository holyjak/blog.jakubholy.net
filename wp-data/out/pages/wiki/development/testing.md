---
title: "Testing"
---
# Testing in General




## Naming Conventions



Based on Working Effectively with Legacy Code, ch.18:


  - Fake\* (ex.: FakeEmailSender) - mocked dependencies
  - Testing\* (ex.: TestingOrderController) - test subclasses of production classes (the Sublcass and Override Method pattern)
  - \*IT, \*Test - integration / unit test classes



Test Doubles: Fake x mock x stub differences [explained by Fowler](https://martinfowler.com/articles/mocksArentStubs.html#TheDifferenceBetweenMocksAndStubs "Mocks Aren't Stubs"):


  - Dummy objects - passed around but never actually used
  - Fake - a working implementation with shortcuts making it unsuitable for production (e.g. in-memory DB)
  - Stubs - provide configured answers to calls made during test and usually nothing outside of these; may also record information about the calls
  - Mocks - "*objects pre-programmed with expectations which form a specification of the calls they are expected to receive*" =\> behavior verification (x state verif.)




## TDD & Value of Testing



Do I always need to write tests first? No, it is not suitable for example when exploring or in general when - for same rare reasons - the benefit is less than the cost (-\> [Economics of Coding](/wiki/development/economics-of-coding/ "Economics of Coding")).

Do I need 100% coverage? Hell no, what is the value of testing getters/setters? (versus the cost?) See Brian Marick's [How to Misuse Code Coverage](https://www.exampler.com/testing-com/writings/coverage.pdf) (also reflected in Martin Fowler's post on [Test Coverage](https://martinfowler.com/bliki/TestCoverage.html)).

Kent Beck answering a [question about how much testing to do](https://stackoverflow.com/a/153565) (highlighted by me):


> **I get paid for code that works, not for tests, so my philosophy is to test as little as possible to reach a given level of confidence** (I suspect **this level of confidence is high compared to industry standards**, but that could just be hubris). If I don’t typically make a kind of mistake (like setting the wrong variables in a constructor), I don’t test for it. I do tend to make sense of test errors, so I’m extra careful when I have logic with complicated conditionals. When coding on a team, I modify my strategy to carefully test code that we, collectively, tend to get wrong.
>
> Different people will have different testing strategies based on this philosophy, but that seems reasonable to me given the immature state of understanding of how tests can best fit into the inner loop of coding. Ten or twenty years from now we’ll likely have a more universal theory of which tests to write, which tests not to write, and how to tell the difference. In the meantime, experimentation seems in order.



Kent Beck has posted a good summary of the benefits of TDD in "[Functional TDD: A Clash of Cultures](https://m.facebook.com/note.php?note_id=472392329460303)" – double checking of the logic (by the implementation and the, preferably quite different, test), solution decomposition (focus on part of the problem, once solve be sure it stays solved),  automatic checking of correctness, outside in design (API first, implementation after that). Plus the pleasant experience of the continuous cycle of tension (failing test) – relief (green).

Update: See [Do You Know Why You Are Testing?\! (On The Principles Underlying TDD)](/2012/10/27/the-principles-underlying-test-driven-development-or-why-you-should-tdd/ "Permanent link to Do You Know Why You Are Testing?! (On The Principles Underlying TDD)")


## References




  - [It’s Not About the Unit Tests - Learning from iOS Developers](https://pragprog.com/magazines/2012-10/its-not-about-the-unit-tests): iOS developers don't do much testing yet they manage to produce high quality. How is that possible? The key isn't testing itself, but caring for the code. (Of course, iOS is little special: small apps, no legacy, a powerful platform that does lot for the apps, very visual apps.)




# Unit Testing Toolbox (for Java)



A collection of test-related links to libraries, tools, utilities, concepts etc.


## Notes about Java testing




  - Access to tested methods - non-private methods & test in the same directory or private methods accessed via java.lang.reflect and setAccessible [http://www.onjava.com/pub/a/onjava/2003/11/12/reflection.html?page=last\&x-showcontent=text](https://www.onjava.com/pub/a/onjava/2003/11/12/reflection.html?page=last&x-showcontent=text).
  - JUni 4.4: assertThat and fluent API via Hamcrest (use junit-dep and full Hamcrest to get much more matchers than the few integrated into JUnit)
      - JUnit 4: @Test, @Before, @After, *@RunWith(value=Parameterized.class)* and *@Parameters public static Collection\<Object\[\]\> data() { ... }*; and public void testXY(Object param...);
  - Great support for testing in Groovy
      - [Gmock](https://gmock.org/) - very easy to use and very readable code, e.g. mock only selected methods and static methods... . Used inside a GmockTasteCase or GroovyTestCase
      - GroovyTestCase - uses just the standard Java assert instead of the various assertEquals etc. Ex.: *assert bluegroupsService.groupExist("noSuchGroup")* =\> *java.lang.AssertionError: Expression: bluegroupsService.groupExist(*noSuchGroup*)*
      - [ObjectGraphBuilder](https://groovy.codehaus.org/ObjectGraphBuilder)




## Libraries for unit testing




  - **[Unitils](https://www.unitils.org/summary.html)** (Java 5) -

    > an open source library aimed at making unit testing easy and maintainable. Unitils builds further on existing libraries like [dbunit](https://www.dbunit.org/) and integrates with [JUnit](https://www.junit.org/) and [TestNG](https://testng.org/). Unitils provides general asserion utilities (e.g. via reflection), support for database testing, support for testing with mock objects and offers integration with \[or mocking out\] [Spring](https://www.springframework.org/), [Hibernate](https://www.hibernate.org/) and the Java Persistence API (JPA). It has been designed to offer these services to unit tests in a very configurable and loosely coupled way. As a result, services can be added and extended very easily. EasyMock integration

    (I'd personally prefer Mockito). See for example *ReflectionAssert.assertReflectionEquals*, which recursively compares JavaBeans without using their equals, i.e. comparing only primitive values - extremely useful\! (Groovy has something similar.)

  - Mocking

      - [PowerMock](https://code.google.com/p/powermock/) (Java 5) - mj. umí mock pro statické metody; rozšiřuje EasyMock/Mockito použitím custom classloaderu a bytekódové manipulace tkž může mockovat statické, privátní a final metody aj. Podporuje EasyMock a Mockito.
      - [JBoss jsf-mock](https://community.jboss.org/wiki/MockObjectsforTestDrivenJSFDevelopmentorgjbosstest-jsfjsf-mockproject "an intro article"): can be used to create mock objects for all the main JSF entities. Also the library is fully compatible with JSF 2.0

  - Concurrent code testing (some of these are old but it doesn't mean they're worthless\!)

      - [MultithreadedTC](https://www.cs.umd.edu/projects/PL/multithreadedtc/overview.html) (2007) is a wonderful framework for testing concurrent applications; it enables you to test a particular interleaving of blocking method calls from different threads (once all threads block, it increases its counter and notifies any thread waiting for the counter).
      - [junit-toolbox](https://code.google.com/p/junit-toolbox/)' [MultithreadingTester](https://junit-toolbox.googlecode.com/git/javadoc/com/googlecode/junittoolbox/MultithreadingTester.html) (run concurrently, several times), [ParallelRunner](https://junit-toolbox.googlecode.com/git/javadoc/com/googlecode/junittoolbox/ParallelRunner.html) (run @Test/@Theory methods in parallel)
      - [tempus-fugit's ConcurrentTestRunner](https://tempusfugitlibrary.org/documentation/junit/parallel/) (2011)- each @Test runs in its own thread; its ConcurrentRule with @Concurrent(count = \#threads) enables you to run a particular test in several threads at once and can be combined with RepeatingRule + @Repeating(repetition = \#) to run in multiple times in each thread. It has also [other goodies](https://tempusfugitlibrary.org/documentation/) worth checking out.

  - Integration

      - [JBoss Arquillian](https://java.dzone.com/articles/arquillian-making-integration "JBoss Arquillian") - in-container (integration) testing of JEE
      - [Dumbster](https://quintanasoft.com/dumbster/) - mock SMTP server for unit testing (start in @Before, get sent messages, stop)

  - Specific environments

      - LDAP: embedded LDAP for unit testing w/ apacheDS: [apacheds-for-unit-tests (v1.0)](https://directory.apache.org/apacheds/1.0/using-apacheds-for-unit-tests.html) (or [for v1.5](https://directory.apache.org/apacheds/1.5/using-apacheds-for-unit-tests.html), which adds dynamic schema and config.)
      - J(2)EE - [Mockrunner](https://mockrunner.sourceforge.net/) “stubs out J2EE by magic”; it has stubs that provide out of the box functionality for JMS, JDBC, Servlet and many other J2EE APIs. It should allow unit testing of code that depends on J2EE APIs outside a container.

  - Various

      - [MagicTest](https://www.magicwerk.org/page-magictest-overview.html "MagicTest"): Allow to check multiple exceptional states in 1 method with nearly no overhead (exceptions are catched and stored and you can then say that they're the expected result); [an intro article](https://java.dzone.com/articles/effectively-handling "an intro article")
      - [parallel-junit](https://parallel-junit.dev.java.net/ "parallel-junit") - A small library that lets you run JUnit tests in parallel.
      - [NetBeans' Memory Leak Unit Test](https://blogs.sun.com/tor/entry/leak_unit_tests "NetBeans' Memory Leak Unit Test") library (assertGC performs some dirty tricks to make sure that GC is indeed run and, if the weak reference under test hasn't been GC-ed, prints details of who references the object)
      - JBoss [Byteman](https://www.jboss.org/byteman) - tool for [fault injection into the tested code](/2012/02/25/cool-tools-fault-injection-into-unit-tests-with-jboss-byteman-easier-testing-of-error-handling/) via AOP and orchestrating multipe threads to exercise possible concurrency issues

  - JUnit addons and extensions

      - [TwiP](https://twip.sourceforge.net/howto.html "TwiP") (JUnit 4, Java 5) - parameters for individual methods and more - more flexible than @ParameterizedRunner

  - Mutation testing

      - [Jester](https://jester.sourceforge.net/ "Jester") (and Maven plugin Gester) - Kent Beck: *“Why just think your tests are good when you can know for sure? Sometimes Jester tells me my tests are airtight, but sometimes the changes it finds come as a bolt out of the blue. Highly recommended.”* [An intro article](https://www.ibm.com/developerworks/java/library/j-jester/ "An intro article").

  - [QuickCheck](https://java.net/projects/quickcheck/pages/Home) - The goal of QuickCheck is to replace scenario-based testing with specification-based testing. A QuickCheck-based test tries to cover the laws of a domain whereas classical scenario-based testing can only test the validity for heuristically (manually) picked values. Basically QuickCheck is about generators of data.




## Test execution




  - [Test Load Balancer](https://test-load-balancer.github.com/) - partitions your tests for executing them in parallel in multiple threads or machines while doing also some other interesting stuff like re-ordering them to have the last failed ones first. It makes sure no tests is executed more times and none is omitted. A benefit is that it is standalone tool that can be integrated into private builds, CI etc. It's written in Java but supports also non-JVM languages. Currently (10/2011) it supports for example. JUnit, Cucumber, Ant, Java, Ruby. Support for Maven is in progress. What it does in detail: "Balancer gets a list of all the tests that need to be executed from the build script (after the build script has been invoked, and before tests start running). It then prunes that list to make a subset using the historical test information obtained from the Server. This smaller subset is passed-on to the test framework to execute. Balancer continues to listens to events published by the test framework as these tests execute, to record result and time taken by each test. This data is then posted across to the TLB server and acts as seed data for balancing/ordering future builds."




# Testing-Related Links




  - [The Way of Testivus](https://docs.google.com/viewer?url=http://www.agitar.com/downloads/TheWayOfTestivus.pdf "(PDF)") - ancient eastern testing wisdom :-) - really worthy brochure for all pragmatic testers
  - Blog [Cost of Testing](https://java.dzone.com/articles/cost-testing) (10/09)  - a two-week one-man experiment in coding with testing with interesting results such as that only 10% of time was spent writing tests even though their extent is 40-50% of the whole codebase (mainly because tests are usually quite simple, no complicated logic etc.)
  - [Alberto Savoia: Beautiful Tests](https://cdn.ttgtmedia.com/searchSoftwareQuality/downloads/BeautifulTests.pdf) (a chapter from Beautiful Code) - a good and inspiring example of the though process behind creating a set of tests. Included: a smoke test, gradual addition of boundary tests, randomized testing, testing of performance characteristics. Conclusion: Writing test code can be every bit creative and challenging and tests document the code’s intended behavior and boundaries; help you improve the code; help you gain confidence in the functionality and performance.
  - [Getting Started with Tdd in Java using Eclipse \[Screencast\]](https://www.dzone.com/links/rss/getting_started_with_tdd_in_java_using_eclipse_sc.html) - TDD in practice with application of a number of best practices and interesting ideas regarding testing (such as not having for 1 production class just 1 test but more, one for each specific test setup). It has 50m but is really worth the time
  - [xUnitPatterns](https://xunitpatterns.com/) - one of the elementary sources that anybody interested in testing should read through. Not only it explains all the basic concepts ([mocks](https://xunitpatterns.com/Mock%20Object.html), [stubs](https://xunitpatterns.com/Test%20Stub.html), [fakes](https://xunitpatterns.com/Fake%20Object.html),...) but also many pitfalls to avoid (various [test smells](https://xunitpatterns.com/Test%20Smells.html) such as [fragile tests](https://xunitpatterns.com/Fragile%20Test.html) due to *Data Sensitivity*, *Behavior Sensitivity*, *Overspecified Software* \[due to mocks\] etc.), various strategies (such as for [fixture setup](https://xunitpatterns.com/Fresh%20Fixture.html)), and general [testing principles](https://xunitpatterns.com/Principles%20of%20Test%20Automation.html).
  - [Infinitest](https://infinitest.org/) is an interesting tool that brings [Continuous Testing](https://groups.csail.mit.edu/pag/continuoustesting/tutorial.html) to your IDE (similar to Kent Beck's JUnitMax) & [an experience report](https://java.dzone.com/articles/giving-infinitest-and)
  - When software testing failes -ARIANE 5 Flight 501 FailureReport by the Inquiry Board
  - Blog: [extremely readable test of a web app](https://paulszulc.wordpress.com/2009/08/25/writing-even-more-readable-and-maintainable-tests/) and [even more readable webapp test](https://paulszulc.wordpress.com/2009/08/25/writing-even-more-readable-and-maintainable-tests/) - really inspiring
  - F. Martinig's [10 + 1 Favorite Unit Testing Articles](https://blog.martinig.ch/?p=304), 2009
  - [Upcoming: Javascript Testing Framework Comparisons](https://blog.james-carr.org/2009/07/22/upcoming-javascript-testing-framework-comparisons/)




## Testing services etc.




  - [VM wth IE 6-9 - ievms](https://xdissent.github.com/ievms/) (make take hours to install)
  -  [http://www.browserstack.com/](https://www.browserstack.com/) -- testing with proper machine through the browser, support for IE, mobile, and more




## Code quality metrics



Bad quality =\> harder testing, that's why it is here.


  - [Testability-explorer](https://code.google.com/p/testability-explorer/) by Misko Havery, the Google testing guru - an open-source tool, which analyzes Java bytecode and computes how difficult it will be to write unit tests for the code
  - [ckjm](https://www.spinellis.gr/sw/ckjm/)— Chidamber and Kemerer Java Metrics - WMC: Weighted methods per class, DIT: Depth of Inheritance Tree, NOC: Number of Children, CBO: Coupling between object classes, RFC: Response for a Class, LCOM: Lack of cohesion in methods. Bonus - Ca: Afferent couplings,NPM: Number of public methods
  - [Simian](https://www.redhillconsulting.com.au/products/simian/ "External Link") (Similarity Analyser; free for non-commercial use)




## Books




  - Martin Fowler: [XUnit Test Patterns - Refactoring Test Code](https://xunitpatterns.com/ "XUnit Test Patterns - Refactoring Test Code"), 2008 - patterns and anti-patterns for unit tests (I haven't read it yet)
  - [Lasse Koskela: Effective Unit Testing: A guide for Java Developers](https://www.amazon.com/Effective-Unit-Testing-guide-Developers/dp/1935182579/) (2013) - guide for writting better tests for those who already know how to test. A major part is a catalog of test smells in the form description - example - how to fix - summary, grouped by the topics of readability, maintainability, trustworthiness.  There are also chapters on mocking, testign with Groovy, testable design, speading up test execution etc. [Read this review](https://www.amazon.com/review/R2QZ8BRNFLQPVO/ref=cm_sw_r_fa_cm_cr_notf_app_fbt?post_id=100000437359523_114035022115712#_=_).




# Test code samples & discussion




## Naming



What can be improved with test method name
@Test public void empty\_credit\_card\_number\_should\_return\_false ?


  - I believe it should rather be called ...should\_be\_invalid because we want tests to "tell a story", to be more business logic-oriented ("card invalid") than implementation-oriented ("return false"); with my name it's OK to change the validate(..) method to throw an exception instead of returning false while the original name would need to be changed




## Decide in the latest responsible moment



What could be improved with the following 1st test method code in the TDD approach?
... assertFalse(CreditCardValidator.validate("")); ...


  - I believe it's completely unnecessary and harmful to assume and enforce that there 1) exists the class CreditCardValidator 2) and that it has a statically-caled method; what if we later decide that we actually need an instance method instead (which is quite likely)?
  - I think that a better solution is to begin by adding the method validate(..) to the test class itself and let this method decide how to perform the validation
    \-- thus we can start implementation right there before migrating to a suitable target class
    \-- it's no-brainer to switch from static call to instance call because there is just 1 place to change
    \-- this approach allows us to postpone the decision how the vlaidation is called til the latest possible moment =\> one of the Lean thinking gold principles
    \-- when things become more stable, it's a simple refactoring to inline this helper method




<div class="linkscent-iconblock" style="float:none !important;border:0 solid #ff0000 !important;background:none repeat scroll center center transparent !important;width:auto !important;height:auto !important;display:block !important;overflow:visible !important;position:static !important;text-indent:0 !important;z-index:auto !important;max-width:none !important;min-width:0 !important;max-height:none !important;min-height:0 !important;left:auto !important;top:auto !important;bottom:auto !important;right:auto !important;line-height:16px !important;white-space:nowrap !important;margin:0!important;padding:0!important;">

![](//interclue/content/cluecore/skins/default/pixel.gif)![](//interclue/content/cluecore/skins/default/pixel.gif)

</div>




<div class="linkscent-iconblock" style="float:none !important;border:0 solid #ff0000 !important;background:none repeat scroll center center transparent !important;width:auto !important;height:auto !important;display:block !important;overflow:visible !important;position:static !important;text-indent:0 !important;z-index:auto !important;max-width:none !important;min-width:0 !important;max-height:none !important;min-height:0 !important;left:auto !important;top:auto !important;bottom:auto !important;right:auto !important;line-height:16px !important;white-space:nowrap !important;margin:0!important;padding:0!important;">

![](//interclue/content/cluecore/skins/default/pixel.gif)![](//interclue/content/cluecore/skins/default/pixel.gif)![](//interclue/content/cluecore/skins/default/pixel.gif)![](//interclue/content/cluecore/skins/default/pixel.gif)![](//interclue/content/cluecore/skins/default/pixel.gif)![](//interclue/content/cluecore/skins/default/pixel.gif)![](//interclue/content/cluecore/skins/default/pixel.gif)

</div>
