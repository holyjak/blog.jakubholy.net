---
title: "About"
---
![Me in 2011](https://lh5.googleusercontent.com/-MWInauot6bc/Tlp7fibsn7I/AAAAAAAACK0/p9hAB-x7XJo/s800/foto-jakub-at-iterate.jpg)I'm a full stack developer from the JVM land since 2005, and occasionally a project manager, working currently with [TeliaSonera Norway](https://teliasonera.no/), in Oslo, Norway. Until 2015 I was a member of the great [Iterate AS](https://www.iterate.no/) family and for a couple of years before that I had also the pleasure to work with IBM Austria and [IBA CZ](https://www.ibacz.eu/-English-). During the years I've worked on large and long-term international projects as well as small local ones and both on new and maintenance projects in various positions.

I enjoy working with people, sharing knowledge, being creative and exploring new stuff. I don't like tedious, repetitive work (though it really is sometimes necessary) and am thus a big fan of automation and tools that can take it over. Having maintained a lot of old code, I really appreciate high-quality, well-written code and good and automated unit tests. I am especially interested in developer productivity, DevOps, testing, and performance.

I'm also very fond of the lean thinking and agile principles, especially feedback-based development, focus on creating true value ASAP, and respect for people. I am fascinated by post-taylorist organizations that value autonomy and human needs over command & control, such as Zappos. The longer I work in IT, the more I see software development as a human, not a technical problem.

I have recently fallen in love with Clojure\[Script\] and functional programming and am exploring [reactive programming](https://www.reactivemanifesto.org/). I've summarized crucial aspects of my approach to development in [Frustration-Driven Development – Towards DevOps, Lean, Clojure](/2014/03/17/frustration-driven-development-towards-devops-lean-clojure/).

You can learn more at my [LinkedIn profile](https://cz.linkedin.com/in/jakubholydotnet).


## Bio & personal



I was born in 1980. For the second time I was born on November 17, 1989, when the communist regime of Czechoslovakia begun to collapse. For the third time I was born in august 2005, when a thin branch, invisible in the total darkness, saved me from a fast and fatal fall. I studied software engineering at the Czech Technical University and humanities at the Charles University. I also spent two enriching terms at the Linköpings University in Sweden. After the studies I ended up in the company IBA CZ, which turned out to be a warm and friendly place, full of great - nice and smart - people, with challenging tasks and a lot of flexibility. In 2011 I've moved to Norway to broaden my views by living in another country and culture. I'm married and live currently in Oslo, Norway (my [Czech](https://jakubholy.net/en/cesko.html) home town has been [Prague](https://picasaweb.google.com/lh/view?q=prague&psc=G&filter=1# "pictures of the lovely city of Prague") in the previous years).

In my free time I like to hike, practice yoga, meditate, read fantasy, and play pen\&paper Role-Playing Games. I like books by Andrzej Sapkowski and (unrelated:)) admire Mahatma Gandhi. I'm vegetarian because I couldn't find any moral justification for killing other beings.


## The world around us



The motto of our police is "Help and protect". I believe that this is actually the mission of every human, to help and protect others and especially the weaker ones, including not only other humans, but all living beings and the nature itself. Unfortunately too often is this maxim superseded by an attitude that could be summarized as "Take money and run". If there were more altruism and compassion than egoism and limitless desires accompanied by wretchlessness, the world would be a much better place. I'm glad there are some people who care, such as [R. Stallman](https://www.stallman.org/), those in Amnesty International and Greenpeace, or a boy in the neighborhood helping an old lady.


## Thoughts on development



My early experiences in commercial development brought me on the quest for *productive development of a software of high inner and outer quality*. By productive development I mean that most time is spent bringing real value to the customer and not writing plumbing code, doing mindless and repetitive "monkey coding" or fighting with the environment and tools. Inner quality means good documentation and [high-quality, maintainable code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882 "Clean Code: the Bible of those striving for high-quality code"). Outer quality covers especially (an acceptable) performance, but also the often neglected usability and doing what the customer actually needs.

I learned that however technical our profession is, the essential skill necessary for success in IT is a non-technical one - communication. This is best illustrated by the following picture from blogcmmi.com, which I like a lot (though it omits the equal importance of intra-team and personal communication):


### ![](https://lh5.ggpht.com/_btcPMCQkYvg/TAjNsPzoeJI/AAAAAAAABX4/9vQ-O__nWN4/s800/requirements-communication.jpg)



As mentioned above, [Frustration-Driven Development – Towards DevOps, Lean, Clojure](/2014/03/17/frustration-driven-development-towards-devops-lean-clojure/) summarizes well what & why I am trying to do.


### My professional interests



People


  - Build great, self-motivated, self-organizing teams of happy people
  - Empower people to find solutions
  - Autonomy, mastery, purpose (\<- [Drive](https://www.ted.com/talks/dan_pink_on_motivation.html))



Build the right thing


  - Find out what the client really needs and if she really needs it - see Impact Mapping
  - Create the maximal business value possible at minimal costs, stop when enough reached
  - Empirical process control, feedback, agility
  - MVP, Specification by example, [Evo](https://www.gilb.com/Project-Management), the 80:20 rule (80% value gained from 20% of the SW, \> 50% never/so rarely used that not worth having)



Build it right


  - Clean code, software craftmanship =\> maintainable, evolvable software
      - TDD, simplicity, "build the quality in," continuous deployment, ...
  - Performance, security etc.



Build it quickly


## My open source projects



Having received so much from the open source community (Linux, Firefox, OpenOffice and counless others), I feel obligated to give something back. Most of own my latest projects live at [my GitHub account](https://github.com/jakubholynet).


### Current projects



[See my GitHub repositories.](https://github.com/jakubholynet?tab=repositories)


### Old (less active) projects




#### J(2)EE Holy Utils, a diverse collection of small projects



The [J(2)EE Holy Utils](https://jeeutils.sf.net/) include the projects listed below:


  - [**ClassLoaderViewer.jsp**](https://sourceforge.net/apps/mediawiki/jeeutils/index.php?title=Main_Page#1._ClassLoaderViewer.jsp) - utility JSP for finding out where a class is loaded from, whether one class can see another one or a particular resource and from where is it loaded
  - [**GroovyConsole servlet**](https://sourceforge.net/apps/mediawiki/jeeutils/index.php?title=GroovyConsole_servlet_or_portlet) - a JSP page and two jars constituting a console for executing [Groovy](https://groovy.codehaus.org/) (Java-like scripting) commands on an application server - great if you need to explore the live environment or experiment with enterprise applications and their libraries that you can't get working stand-alone
  - **[DbUnit Express](https://sourceforge.net/apps/mediawiki/jeeutils/index.php?title=DbUnit_Test_Skeleton)** - a layer over DbUnit that extremely simplifies creation of tests agains an embedded Derby database by using convention over configuration and adjusting the default settings (create a .ddl, a .xml with data, extend the base class or create & init an instance and run) and provides few additional utilities (getDataSource, RowComparator). Supports Maven. As a testing fan, I use it on nearly any project.




<div>

Standalone projects that could be a part of JEE Holy Utils:

</div>




<div>

  - [perfstats-lib](https://github.com/jakubholynet/perfstats-lib) - a light-weight, minimalistic, low-overhead library for collecting and publishing performance statistics in production systems
  - **[static-jsfexpression-validator](https://github.com/jakubholynet/static-jsfexpression-validator)** - build-time validation of EL expressions in JSF pages, check the (older) [JSF EL validator introduction](/2011/06/22/validating-jsf-el-expressions-in-jsf-pages-with-static-jsfexpression-validator/)

</div>




#### MiniPauker, mobile learning application



[MiniPauker](https://MiniPauker.sf.net/) is a J2ME flashcard learning application for mobile phones, a little brother of the desktop application [Pauker](https://Pauker.sf.net/). It's great for example for learning and repeating vocabulary. The primary features for me are that it can draw the "cards" to repeat in a random order and that it presents you primarily with the cards you have troubles remembering. It was originally developed by Markus Brosch, I took it over in 2009.


  - [jEdit](https://jedit.org/) editor plugin [TextAutocomplete](https://plugins.jedit.org/plugins/?TextAutocomplete)
  - [MobileBackup](mobilebackup.sourceforge.net) - a J2ME application for backing up and restoring contacts, calendar entries etc. on mobile phones - I've inherited it and extended to support also restore in addition to backup
