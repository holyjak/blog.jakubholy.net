---
title: "Eclipse"
---
Eclipse notes and tricks.

Check also my [blogs in the eclipse category](http://theholyjava.wordpress.com/category/eclipse/) .

# My favorite Eclipse magic

(Shortcuts under Mac - under Linux they're likely the same only having Ctrl instead of ![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif))
(| indicates position of the cursor; ![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif) is Command, ![Shift icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_shift.gif) is Shift, ![Option or Alt key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_option.gif) is Alt, ^ is Control)

* **Open Type** (![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)![Shift icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_shift.gif)T) - quickly find any class on the classpath
* **Open Resource** (![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)![Shift icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_shift.gif)R) - quickly find any file in the project
* **Quick Outline** (![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)O) - opens a pop-up similar to the Outline view but filterable with support for the * wildcard - useful for jumping quickly to a method/member (much better than search)
* **Smart Complete**(^Space) - complete just about anything (variables, methods, types, ...) including predefined Code Templates and more
  - Class-level completion (press ^Space anywhere outside of a method for all proposals or type first few letters of what you want first)
    + Override/implement method: start typing the name of the method, e.g. "toS" for toString() - or just press ^Space and select the proposition you want
    + Quick constructor creation: if the class has no constructor, just press ^Space, it should come first
    + Quick setter/getter generation: as above
  - Create for/foreach loop to loop over Iterable/Collection/array - type "for" and ^Space
  - Surround with try-catch or another block statement (do/while/for loop, try-catch, synchronized, if, runnable) - select at least two lines and ^Space, go to the end of the proposition list (via up arrow in the list)
  - Print to sysout/syserr: select 1 line and ^Space, go to the last propositions
* **Quick Fix** (![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)1) - proposes things you are likely to do; experiment with how the proposals differ based on where exactly your cursor is and what is or is not selected
  - Create new field initialized in a constructor: declare the constructor's parameter (leaving cusrsor just behind the name), press![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)1 and select Assign parameter to new field.
  - Introduce local variable: select a statement and![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)1
  - Complete definition of a new local variable - type: type e.g. "a = new String();|" and![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)1, select "Create local variable 'a'" (notice also the other options - field and parameter).
  - Convert local variable to field (cursor behind variable's name), also Inline local variable
  - Many other - just experiment
* **Open Call Hierarchy** - right-click, select it
* **Organize Imports** (![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)![Shift icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_shift.gif)O)
* Minor
  - **Convert to static import** -![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)![Shift icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_shift.gif)M on a static method/constant ([not yet available via quick-fix](https://bugs.eclipse.org/bugs/show_bug.cgi?id=197850) :-()
  - **Next editor** (![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)F6) - to cycle between open files.
* Completion - swtich between insert (default) and override - hold Ctrl (see Java - Editor - Content Assist - Insertion)

Other noteworthy things:

* When you search for class name (Open Type, completions), Eclipse is clever enough to deal with abbreviated forms like IA, IAE, IllArgEx etc. when searching for IllegalArgumentException.
* Quick Access (![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)3) - search in open windows, options, views, commands, ...
* Word completion (useful e.g. in JavaDoc): Alt+/ (this and previous tips are [from K. D. Sherwood](http://blog.webfoot.com/2007/08/13/semi-robobait-way-cool-eclipse-keyboard-shortcuts/))
* Copy/Move Line (![Command key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_command.gif)![Option or Alt key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_option.gif)![Shift icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_shift.gif)/![Option or Alt key icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_option.gif)![Shift icon](http://km.support.apple.com/library/APPLE/APPLECARE_ALLGEOS/HT1343/ks_shift.gif) or down)

Johannes Brodwall: [Some eye-openers that people enjoy learning](http://johannesbrodwall.com/2010/02/18/using-eclipse-better/) (copy/move line and other valuable things - check it out!).

# Coding help

## Various

### Simple import of static methods

If you have some static methods that you use often - such as JUnit's Asserts Mockito's fluent API - you may enable Eclipse to add the necessary static imports by adding these types to your Favorite imports:

Java -> Editor -> Content Assist -> Favorites, click [New Type...] and select the class defining the static method.

Normally when you type the name of a static method defined in another class, Eclipse will complain about non-existing method and doesn't offer you to create a static import for the method, unless it is among the favorite imports.

My favourites:

```
org.hamcrest.CoreMatchers.*;
org.hamcrest.Matchers.*;
org.junit.Assume.*;
org.junit.Assert.*;
org.mockito.Mockito.*;
org.mockito.Matchers.*;
```

Source: Piotr Jagielski's blog [Working With Static Imports in Eclipse](http://piotrjagielski.com/blog/working-with-static-imports-in-eclipse/) .

## Templates

### Logging

From the article [The Dark Art of Logging](http://blog.yohanliyanage.com/2010/11/the-dark-art-of-logging/) (2010).

#### Variant A: commons-logging

Window -> Preferences -> Java -> Editor ->Templates.

Log declaration ("logdef"):

[code language="java" light="true"]
${:import(org.apache.commons.logging.Log, org.apache.commons.logging.LogFactory)} private static final Log LOG = LogFactory.getLog(${enclosing_type}.class);
[/code]

"debug":

[code language="java" light="true"]
if (LOG.isDebugEnabled()) {
 LOG.debug("${enclosing_method}: ${msg}");
}
[/code]

#### Variant B: Java logging

As above except the templates themselves.

logdef:

[code language="java" light="true"]
${:import(java.util.logging.Logger)} private static final Logger LOG = Logger.getLogger(${enclosing_type}.class.getName()) ;
[/code]

#### Default action in a catch block

Change the action on exception in the template for try-catch blocks through Window -> Preferences -> Java -> Code Style -> Code Templates. Change the Code -> 'Catch block body' and  'Code in new catch blocks'  template to the following.

[code language="java" light="true"]
LOG.error("${msg}", ${exception_var});
[/code]

(Default is exception.printStackTrace().)

### Various

#### Test method

A slight modification of the default "Test" template:

[code language="java" light="true"]
@${testType:newType(org.junit.Before)}
public void setUp() throws Exception {
 //MockitoAnnotations.initMocks(this);
 ${cursor}
}
[/code]

Also `setUp` may be useful:

[code language="java" light="true"]
@${testType:newType(org.junit.Test)}
public void ${testname}() throws Exception {
 ${staticImport:importStatic('org.junit.Assert.*')}fail("not yet implemented");${cursor}
}
[/code]

# Favorite Plugins

* DBViewer
* JUnitMax
* [AnyEdit Tools](http://andrei.gmxhome.de/anyedit/) (text and whitespace conversions etc.)
* [Properties Editor](http://propedit.sourceforge.jp/index_en.html)
* m2eclipse
* Git: ?
* Checkstyle

Experimenting with:

* Crap4j
* CodePro AnalytiX

# Using Eclipse at Presentations

* Increase font size
  - Text font: Ctrl+ and Ctrl- with [Tarlog's plugin](http://code.google.com/p/tarlog-plugins/) or Preferences - General - Appearance - Colors and Fonts (or just search for Fonts) - select Basic - Text Font and edit it
  - Tab labels: View and Editor Folders - Part title font
  - Content of views (e.g. Package Explorer): this cannot be set from Eclipse, it's taken over from the windowing system so you need to [change the font size in your desktop environment](http://techtavern.wordpress.com/2008/09/24/smaller-font-sizes-for-eclipse-on-linux/) (in GTK/..)
* Hide clutter - the best way is to create a new Perspective for presentations without unnecessary toolbar and menu elements
  - Right-click the top toolbar and select Hide Toolbar (redisplay: menu Window - Show Toolbar)
* Try one of the Fullscreen plugins for Eclipse, f.ex. U. [Sangiorgi's Eclipse-Fullscreen plugin](https://github.com/ugosan/Eclipse-Fullscreen/) ([download](https://github.com/ugosan/Eclipse-Fullscreen/blob/master/build/plugins/org.ugosan.eclipse.fullscreen_1.0.8.jar?raw=true) into dropins/, 9/2011 in E3.6, Pref. - General - Full Screen - choose whether to hide menu and/or status bar, see Window - Full Screen and Alt+Ctrl+Z or Esc) or M. [Scharf's Eclipse Mode](http://marketplace.eclipse.org/content/fullscreen-mode) plugin (12/2009, tested in E3.6) - hides the title bar (but not the status bar)

Beware that the settings are valid for a workspace -> you may want to create a new one for the presentation.

You may also want to try the Eclipse [Presentation Theme](https://github.com/ujhelyiz/Presentation-Theme) by Zoltán Ujhelyi to make switching to a bigger font size easier.
