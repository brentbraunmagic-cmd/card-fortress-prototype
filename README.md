# Memory Fortress prototype

A mobile-first, dependency-free prototype of the card memorization fortress game.

At launch, players choose Mnemonica, Patrick Redford's Redford Stack, or Simon Aronson's Aronson Stack. Each complete 52-card stack is trained across four sectors: 1–13, 14–26, 27–39, and 40–52.

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

The stack constants near the top of `app.js` contain the complete 52-card Mnemonica, Redford, and Aronson orders. `STACKS` controls the choices presented on the launch screen.
