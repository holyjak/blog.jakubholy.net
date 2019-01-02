---
title: "Why lean?"
---
<div style="background-color:lightgrey;font-weight:bold;padding:10px;margin-bottom:10px;">

THIS IS ONLY A DRAFT

</div>

Lean in keywords: autonomy feedback agility experimentation learning continual-improvement latest-responsible-moment humility

For me, lean is about admitting that the world around us is too chaotic, too changing, for us to be able to comprehend it fully and to control it. It is about giving up the false illusion of control that detailed, long-term plans and command & control structures provide and adopting a process suitable for our real chaotic environment, a process based on empirical control. An empirical process is constantly being adjusted based on the feedback from the environment. It is a scientifical process: you form an hypothesis, act, observe the results, and adjust accordingly.

The consequences of adpoting the lean approach are manifold. To be really able to experiment, learn, and react quickly, you must enable the people at the front line to do that, the command & control chain is too long, slow, and distant from the situation. They must have motivation, autonomy, power to decide. And the teams must be cross-functional to be able to grasp the situation and act effectively (leading to DevOps etc.). You must relentlessly question and improve your process because it is never perfect and because the situation keeps on changing. You must focus on creating fast feedback loops - for software development, this eventually leads to continuous delivery and high focus on code quality.

Lean software development: Admit that nobody really knows what should be built and that it thus has to be found out via experimentation (hypothesis -\> feedback). Therefore it is crucial to start by understand the business need/value. Be aware that software doesn't just fit into a situation, it effects it - therefore ask how the processes are going to change due to / for the sake of the software to be developed. Build cross-functional teams (devops, testers, business). Do not base the development on plans but on business value and goals and measuring the project's contribution to them. Be aware of the cost of complexity and the 80:20 rule and stop the development when enough business value has been providing (preferably before implementing the other 60-80% of the features that would be rarely used but multiply the complexity). Be aware of the fact that there can be a much cheaper, faster, perhaps non-technical solution to the business need.

TODO: Resources, ideas

  - Antifragile =\> principles (motiv. people, worker's intelligence, ...)
  - "feedback loops" - link to Kim's blog
  - Beyond Budgeting
  - Tom Gilb: [Agile revised JZ12 talk](https://vimeo.com/49381225), papers, book
  - Gojko Adzic's Impact Mapping
  - Ward Cun. & others: SW devel. is primarily a process of learning (what, why & how to build)
  - Sub-topics:
      - kaizen
      - Lean \<\> agile \<\> code quality
      - cynefin's 4 quadrants
      - Cash to concept - 7 rules of lean, ...
      - quality \<\> speed
      - autonomy x motivation etc.
      - || design

TBD: Continue

## Resources

### Lean, agile, software development

  - [Agile in a Nutshell](http://youtu.be/502ILHjX9EE) (originally Agile Product Ownership in a Nutshell) by Henrik Kniberg - the best explanation of the agile development process ever, in just 15 minutes and with wonderful animation; every developer should see this. Some highlights: the most important task of product owner is to say NO so that backlog doesn't grow infinitely; at start, the estimates of size and value will suck and that's OK because the value is in the conversation, not in the numbers (that are anyway just relative); the goal is to maximize outcome (value), not output (\# features). Compromises between short-term vs. long-term goals, knowledge vs. customer value building etc. Build the right thing (PO) x build it right (devs) x build it fast (SM). Technical debt x sustainable pace. As I said - you MUST see it.
  - [M. Fowler: The New Methodology](http://martinfowler.com/articles/newMethodology.html) - a good description of the rise of Agile, the motivation for it, the various Agile methodologies (XP, Lean, Scrum etc.) and what is required to be able to apply an agile approach. Main points: Agile is adaptive (vs. predictive) and relies heavily on people and their judgement and skills (vs. treating them as same, replacable units) - which also leads to the need of leadership instead of (command\&control) management. Discusses unpredictability of requirements and scope, foolishness of separating design and implementation, difficulty of measurement of SW development, continuous improvement etc. Quotes: "However letting go of predictability doesn't mean you have to revert to uncontrollable chaos. Instead you need a process that can give you control over an unpredictability. That's what adaptivity is all about."
  - [The Toyota concept of 'respect for people'](http://www.reliableplant.com/Read/9818/toyota) - many state that they respect their workers but fail to really understand what it means; it is not about freedom of act, it is about a mutual respect, leveraging the strengths of each other: worker's experience and insight and manager's broader overview, as demonstrated by the problem-solving dialog and challenges (problem - root cause - solution - measure of success, the manager challenging the worker's answers). Also a nice example how the evaluation of individual performance leads to a much worse system and high turnover compared to a whole-oriented company.
  - [It’s a state of mind: some practical indicators on doing agile vs. being agile](http://kosmothink.com/2013/11/13/2636/) - are you agile or are just "doing agile"? Read on ti find out, if you dare\! F.ex. "*Non Agile teams have a process that slows the review of the changes.*" Cocnlusion: "*An Agile mindset is just that – a state of mind, a set of values. Its a constant questioning, and an opening up to possibilities. Its a predisposition to produce great things.*"

### Teaching SW dev

  - Dave Nicolett: [I know how to tie my shoes](http://davenicolette.wordpress.com/2013/05/31/i-know-how-to-tie-my-shoes/) - on the difficulty of convincing people to try unfamiliar software development techniques - "*People change the way they operate when they are experiencing some sort of inconvenience or negative feedback. As long as things are going along reasonably well, people don’t go out of their way to change the way they work.*" (with few exceptions) You can learn to [tie your shoes in a split second](http://www.youtube.com/watch?v=gbaHxsilsKI), but why to invest the effort? You'd need to set aside assumptions, suppress habits, practice. You can argument there are many inconveniences (bugs, criticism for slow delivery, ...) but "Unfortunately, that’s all pretty normal, and most people in the software field are accustomed to it.  They don’t see it as a problem that calls for them to change their practices. Most of them probably have a hard time visualizing a different reality." =\> Maybe that’s the reason there’s been no satisfactory answer to the question of how to convince people to adopt different practices. We shouldn’t be trying to convince people to do anything. We should be helping people solve their problems and achieve their goals. If they are satisfied with the outcomes they achieve using their current methods, then there is no problem to solve.
  - [Why Software Projects are Terrible and How Not To Fix Them](http://sealedabstract.com/rants/why-software-projects-are-terrible-and-how-not-to-fix-them/) - many teams are not ready to embrace new/better software practices, primarly for two reasons: 1) most of them are nonintuitive (f.ex. adding more people will slow dev down) and need to be sold through a high hierarchy of managament - but people/managers/organizations don't really care, it takes years for good/bad practices to have an impact, which is not relevant "now." 2) Businss objectives change too quickly and SW is blamed for not delivering. Based on evaluating many failed projects. Conclusion: Choose carefully people/organizations your work with. Avoid blame-driven ones. Quote on middle managers: "*He has to put more developers on the project, call a meeting and yell at people, and other arbitrary bad ideas.  Not because he thinks those will solve the problem.  In fact, managers often do this in spite of the fact that they know it’s bad. **Because that’s what will convince upper management that they’re doing their best.***" "*In the vast majority of failed projects I’ve been called to looked at, the managers have not read one book on software engineering.*"

## Inspiration for improvement and making an impact

If your process is the same in a year from now then you are far less efficient than you could be. \#kaizen

Learn the rules, practice them, transcend them. No methodology is perfect, no rule or pattern is absolute. You need to think for yourself, question, experiment, think originally.

Forget delivering software. Make an impact, deliver valuable change. What valuable change should your current project cause? And no, software is not alwasy the right answer.

Be humble, respect people, question your thinking. Often we see something, jump to a conclusion, rush for an action, persuaded about our truth and determined to win and change the situation as we want for the good of all involved. Do not act based on unverified assumptions and beliefs - make your though process transparent to yourself and to others, check it with them, act based on open, verifiable data - see the [Ladder of Inference](http://www.mindtools.com/pages/article/newTMC_91.htm) for details (nicely introduced in this 5 min TED video called [Rethinking thinking](http://ed.ted.com/lessons/rethinking-thinking-trevor-maber), by Trevor Maber).
