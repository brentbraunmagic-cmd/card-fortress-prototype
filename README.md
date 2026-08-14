# Memory Fortress prototype

A mobile-first, dependency-free prototype of the card memorization fortress game.

## Run it

Open `index.html` directly in a browser, or serve this folder with any static web server. For example:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Gameplay

- Phase 1: choose a value, then its suit, to build the glowing next position. The ship damages completed cards, so build quickly.
- Phase 2: each of the 13 cards appears once in a shuffled order. Read the falling card and tap its memory position before it lands. Missed cards return in a review round; master all 13 to win.
- Sound effects use the browser's built-in audio system and begin after the first tap. Use the sound button to mute them.

## Customize the stack

`MEMORY_STACK` near the top of `app.js` contains the complete 52-card Juan Tamariz Mnemonica order. The prototype currently trains positions 1–13; later levels can use the remaining blocks.
