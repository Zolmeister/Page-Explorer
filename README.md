Page Explorer
An app that turns any page (http only on chrome) into a giant interactive chatroom where users can move around the page and interact with other users on the same page.

```
npm install
npm start
http://localhost:3003
```

run in the console:

```
var s=document.createElement('script');s.setAttribute('src','http://localhost:3003/inject.js');document.getElementsByTagName('body')[0].appendChild(s);
```

or bookmark:

```
javascript:(function(){var s=document.createElement('script');s.setAttribute('src','http://localhost:3003/inject.js');document.getElementsByTagName('body')[0].appendChild(s);})();
```

note: only works for http pages (not https)

then hit CapsLock to start

controls:

  - Ctrl = Jump
  - arrow keys = move
  - Down = Descend a level
  - Ctrl + up = pull up
  - CAPS LOCK = toggle game (visible/hidden)
  - T = chat (just start typing and the text will appear top-left, then enter to submit)

Blog post: http://www.zolmeister.com/2012/09/how-not-to-write-massively-multi-player.html
