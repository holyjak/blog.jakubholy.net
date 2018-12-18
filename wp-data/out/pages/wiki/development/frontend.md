---
title: "Frontend"
---
## Frontend development tools 2/2014

(By Pål & co.)

### Build & live reload

Have a dev server that live updates when files are saved and can also run tests, builds etc. - see an example here: [https://github.com/iterate/iterateconf/blob/master/Gruntfile.js](https://github.com/iterate/iterateconf/blob/master/Gruntfile.js) (using grunt with watch).

Of course, make sure to use JSHint, testing etc.

### Editor

Any, but f.ex. in **LightTable** it is possible to have code in one pane and live preview of the page in another next to it so the feedback loop is really short.

Tip: Use  **Chrome Web Inspector's workspaces** as development environment when doing lot of changes to HTML/CSS/LESS - "inspect element", change it, WI can store changes back to the original files, after proper configuration. See this [screencast of fully in-Chrome development](http://remysharp.com/2013/07/18/my-workflow-v3-full-coding-stack/) and [description of worskpaces at HTML5 Rocks](http://www.html5rocks.com/en/tutorials/developertools/revolutions2013/#toc-workspaces) . Basically: [chrome://flags](//flags) -  "Enable Developer Tools experiments," web inspector settings - add a new workspace, right-click on a file in the Sources tab and  "Map to Network Resource".

Experimental: Adobe's new JavaScript-based editor [Brackets](http://brackets.io/) looks interesting, good integration with Chrome.

### Framework-specific

AngularJS: [Batarang](https://github.com/angular/angularjs-batarang/) is a must-have Chrome plugin for inspecting scopes and variables.

## Resources

### Related

* [Tools for Editor – Browser Integration for Interactive JS/HTML Development](https://theholyjava.wordpress.com/2013/03/25/tools-for-editor-browser-integration-for-interactive-jshtml-development/ "Permanent link to Tools for Editor – Browser Integration for Interactive JS/HTML Development") (3/2013)
