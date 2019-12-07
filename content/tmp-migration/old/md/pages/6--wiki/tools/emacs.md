---
title: "Aquamacs/Emacs"
---
My personal Emacs/Aquamacs mini-reference. (Without the very elementary stuff that I still happen to remember.)


## Display




  - [Windows](http://braeburn.aquamacs.org/code/master/aquamacs/doc/EmacsManual/Change-Window.html#Change%20Window)
      - Resize split window: Mouse-1 click on the bar between them and drag it.




## Search and RegExp



Search


  - C-S forward (see isearch-forward\[-regexp\])
  - C-R backward
  - M-x query-replace\[-regexp\] - (use isearch-forward-regexp to build the regexp as it interactively displays the matches)
  - Repeat: To repeat or find the next regexp or normal match just press C-r or C-s (w.r.t. desired direction) again (once or twice)



RegExps in Emacs.


  - Key differences: Escape ()| to make them special (group/alternative). Use \[\[:digit:\]\] etc. instead of \\d. \[a-z\] is case insensitive. Non-greedy: .+?.
  - Build an RE interactively (shows matches): M-x re-builder
      - \! You have to [switch into the string syntax](http://www.masteringemacs.org/articles/2011/04/12/re-builder-interactive-regexp-builder/) either interactively (C-c TAB string RET or C-c C-i in the builder) or by default (in the config: (require 're-builder) (setq reb-re-syntax 'string)); (default is read for Lisp source code, other are functio-like [rx](http://www.emacswiki.org/emacs/rx), [sregex](http://www.emacswiki.org/cgi-bin/wiki/SymbolicRegexp), lisp-re)
      - Match TAB: C-q TAB, newline: C-q C-j
      - C-c C-i: toggle case-sensitivity; move between matches: C-c C-s, C-c C-r
      - (Note: You can simple copy the RE and paste it e.g. into C-M % (query replace regexp))
      - C-c C-q quit the re-build
      - See [RE syntax](http://emacswiki.org/emacs/RegularExpression#toc1) (\\s- whitespaces, \\w word constituent)
      - [re-builder+](http://www.emacswiki.org/emacs/download/re-builder+.el) allows interactive building of RE for search and \[query-\]replace-regexp




## Various




  - M-z [zap-to-char](http://www.emacswiki.org/emacs/ZapToChar) - delete all to the given char, inclusive (", ), etc.); (I've rebound it to [zap-up-to-char](http://www.emacswiki.org/emacs/ZapUpToChar))
  - C-RET (via Cua mode) - select a rectangular area =\> cut, yank, etc.




### Speedbar




  - b to buffer list mode, f to file list mode, r to "previous mode"
  - t stop updating w.r.t. current buffer/frame (slowbar mode)




### Navigation




#### Ido & flex matching for fast file/buffer location



The general [InteractivelyDoThings](http://www.emacswiki.org/emacs/InteractivelyDoThings) mode has the great ido-enable-flex-matching option that will automatically show matching completions for commands working on files, buffers etc in the minibufer, e.g. C-x b and copy to switch to the buffer comoyo-puppet. It's genial\!

Tip for ido-open-file (C-x C-f) with ido:


  - // starts search for files under /
  - \~/ under the home dir
  - C-d open dired in the current dir



General C-s/-r: to next/prev match. To fall back to the origina open file: C-f, buffer: C-b.


#### File searching




  - If using IDO: C-x C-f for ifo-find-file then M-f (ido-wide-find-file-or-pop-dir) to search for a file in the current dir and subdirs
  - IDO tip to: typing '\*\*/xyz' seems to find (after a short while) all files containing xyz in the name anywhere on the disk?? (works also without IDO, for dir/subdirs)
  - M-x find-name-dired - prompts for a dir, uses find \<dir\> -iname \<your input\> to find files by name
  - M-x locate - on Mac you might need to [set it to use Spotlight](http://stackoverflow.com/a/4345711)




## Libs




  - Sexp fold/expand is very useful for exploring source code (hide all but the first lines of all top-level forms with hs-hide-all) - the built-in [hs-minor-mode](http://www.emacswiki.org/emacs/HideShow) can hide/show all, or hide/show/toggle one but the keys for it are cumbersome; [hideshow-org](https://github.com/shanecelis/hideshow-org.git) makes it possible to toggle hide/show with TAB, while preserving the original TAB behavior (it does the normal TAB first only only if nothing changes does it expand/fold)




## Links




  - [Using \[w\]dired to rename files](http://johnbokma.com/mexit/2009/03/30/emacs-dired-rename-files.html) etc.
  - [ParEdit Guide](http://clojure.jr0cket.co.uk/perfect-environment/paredit-guide) (from Clojure Made Simple) - wrap with M - \<delimiter\>, extend it with M-); extend to a whole sexp: C-), to throw out a sexp: C-}; for backwards: (, {




# Emacs usability




## The Problem




1.  It is hard to learn \*and remember\* 10s of commands and their key combinations
2.  It is hard to type finger-breaking combinations such as C-c @ C-h - see Xah Lee's [Banish Key Chords](http://xahlee.info/kbd/banish_key_chords.html)



See Xeh's [Emacs Modernization](http://ergoemacs.org/emacs/emacs_modernization.html) posts.


## The Solution




### Ideal solution



Ideally, Emacs would be more discoverable and provide context-sensitive help and offer commands based on the current context and their frequency of use.


1.  Context-sensitive action list similar to IntelliJ's Alt-Enter, Eclipse's Command-1: show the most used actions relevant to the current cursor point; f.ex. at "{" show Go to matching bracket, Select block, Collapse block
2.  Inline help with the most used commands when switching to a new major/minor mode - either embedded in the buffer or a non-intrusive (and fading away?) pop-up; f.ex. for a Dired and Magit buffer
3.  Menus for less frequently used commands (remember, [menus can be accessed from the keyboard](http://www.emacswiki.org/emacs/MenuAccessFromKeyboard))
4.  Use key sequences à la Vim instead of key chords with Ctrl-, Alt-




### Actual solution



*{work in progress}*


1.  ErgoEmacs-mode - more sensible key combinations, \<menu\> key + sequence of letters similar to Vim's command mode
      - See [EE's Banish Key Chords](https://ergoemacs.github.io/banish-key-chords.html) page
2.  [OneKey?](http://www.emacswiki.org/emacs/OneKey) -– customizable in-buffer menus for different types of items (major-mode commands, standard keybindings, yasnippets, etc). Useful for learning keybindings, or quickly finding relevant commands.
3.  discover.el?
4.  ...
