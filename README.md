# Starcoder in Phaser

Not much here yet. Just a few hints for installing and running.

## Installation

You need to do `npm install` to get the node modules downloaded.

## Configuration

Most of what you need is in `Starcoder.js`.

## Running

```
node server.js
```

Note that just like with Isogenic, node only handles the game related stuff. A separate web server will be needed to
server static html, js, etc.

## To Do

A rough, sort of ranked but not really list to achieve parity with Isogenic Starcoder.

* Get crystal pick up and scoring working
* Add proper collision tests for the hydra
* Get dynamic reconfiguration of colors and shapes working (mostly in place, just need to touch up the api)
* Planets
* Trees
* Get ACE and Blockly interfaces working
* Pretty up the fonts and colors
* Chat? (Does this actually work in Isogenic?)

Seems like a lot, but most of these are relatively easy.

## Bugs

Probably more than a few. ~~Right now there's a problem with multiplayer. It worked in a earlier build - I just need to
unroll the change that created it.~~

## Hacking

I'd prefer it if changes were pushed to new branches, particularly if they're just tinkering.

## Deploy
https://www.evernote.com/l/AARJSlBJQuJE_JH5mkbbS9UwrzHpwlFVIvo
