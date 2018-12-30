---
title: "Tools"
---
_(For the index of Tools sub-pages see the [parent page](/wiki/) with its global index.)_

# Mini-notes

* Command line
  - Bash
* Vim
* jq

## Command line

Quickly jump to a directory based on frequency/clever substring matching:

* [z](https://github.com/rupa/z) (zsh, bash) - "z is the new j, yo" - also [j2](https://github.com/rupa/j2) and the fish clone [z-fish](https://github.com/sjl/z-fish)
* [DirB, Directory Bookmarks for Bash](http://www.linuxjournal.com/article/10585?page=0,0) ([home](http://www.dirb.info/)) – moving efficiently among favourite directories (`s <name>` to create a bookmark for pwd, `g <bookmark | relative/abs dir path>` to enter a dir (=> works both for bookmarks and as a replacement for cd); also support for relative path bookmarks & more; `sl` lists bookmakrs in the last used order)
* [Autojump](http://jakemccrary.com/blog/2011/07/25/utilities-i-like-autojump/),[described in Dec 11](/2011/12/31/most-interesting-links-of-december-2/)

### Bash

**Loop with 0-padded numbers** for a number of repetitions (using for and seq, from 1 to 50, outputting 01, 02, .., 50):

```
for i in $(seq -f '%02g' 1 50); do echo $i; done
```

**Basic math** in Bash (addition, ..; using let for a numerical var and $((<expression>)) for math):

```
let num=0; echo $num; INC="1"; num=$((num+$INC)); echo $num
```

## Git

* Undo merge: _git reset --hard ORIG_HEAD_ (the pointer ORIG_HEAD is set automatically by Git)
* Unfo file changes: _git co -- path/to/file/to/reset [other/files/..]_
* _git whatchanged master.._

## Vim - useful advanced commands

* Change/delete a text region
  - <kbd>(d|c)i<delim></kbd> - Delete|change text up to the given delimiting character; requires that you are inside pair delimiters such as "..." or (...); use '<kbd>a</kbd>' to include the delimiters
* Operations on selections (=><kbd>y</kbd> to copy (yank),<kbd>d</kbd>to delete)
  - Select lines (e.g. for deletion via ' `d`'):<kbd>S-V</kbd>
  - Select rectangle (e.g. to delete whitespace):<kbd>C-V</kbd>
* Search and replace with confirmation:<kbd>:%s/foo/bar/gc</kbd>

## jq - sed for JSON

Ex.: Extract nested structure with select, filter combination

```

// INPUT
{"name":"Sony Xperia Z3 Black",
 "dealerDetails":[
    {"dealerGroup":"webshop","rank":3},{"dealerGroup":"CustomerCentre","rank":3}]}
// COMMAND
jq '. | {name: .name, rank: (.dealerDetails|map(select(.dealerGroup == "webshop"))[0].rank)}'
// OUTPUT
{"name":"Sony Xperia Z3 Black","rank":3}
```
