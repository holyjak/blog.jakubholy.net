---
title: "Architecture"
---
Architectural decisions are the decisions that are hard to change later on (contrary to design decisions). One goal of an architect is to minimize them, i.e. design the system so that they are not so important after all. We also try to make it possible to postpone making them as long as reasonable so that we have more knowledge when we eventually make them.

[Kevlin Henney: The Architecture of Uncertainty](http://vimeo.com/68331684) - use uncertainty, lack of knowledge and [options](http://commitment-thebook.com/) to partition and structure the code in a system

It's crucial to understand the needs of the domain - f.ex. the complex, often changing rules of a pension system x transactional processing with focus on security and batch processing in a bank x high volume and importance of speed at a stock exchange.

### Tom Gilb

The goal of architecture is to satisfy requirements (enable delivering desired qualities, respect constraints, costs) -

> Architecture that never refers to necessary qualities, performance characteristics, costs, and constraints is not really architecture of any kind.

Real arch.:

  - Has multidimensional clear design performance **objectives** \[performance = all regarding how it functions, not just speed etc.\]
  - Has clear multiple **constraints**
  - Produces **architecture ideas** which enable and permit objectives to be met reasonably within constraints \[and we can try which works best or combine multiple\]
  - Estimates expected effects

## Resources

### Studying architecture

  - [The Architecture of Open Source Applications](http://www.amazon.com/dp/B00557TMN4/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=15C6Q8OEGS1X2&coliid=I2NEOT2RQLTZB6 "The Architecture of Open Source Applications") and [The Architecture of Open Source Applications, Volume II: Structure, Scale, and a Few More Fearless Hacks](http://www.amazon.com/dp/B008940UYK/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=15C6Q8OEGS1X2&coliid=I3ADMW0YBTXFUP "The Architecture of Open Source Applications, Volume II: Structure, Scale, and a Few More Fearless Hacks") - " the authors of twenty-five open source applications explain how their software is structured, and why"

### Other

  - [Architecture War Stories](http://www.infoq.com/presentations/architecture-disaster) by Stefan Tilkov on Oct 04, 2014 (talk, 45 min)
