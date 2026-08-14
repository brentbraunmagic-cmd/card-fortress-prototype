# Memory Fortress prototype

A mobile-first, dependency-free prototype of the card memorization fortress game.

## Run it

Open `index.html` directly in a browser, or serve this folder with any static web server. For example:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Gameplay

- Phase 1: choose a suit, then tap or drag the correct rank into the glowing next position. The ship damages completed cards, so build quickly.
- Phase 2: read the falling card and tap its matching memory position before it lands. Intercept 10 bombs to win.

## Customize the stack

Edit `MEMORY_STACK` near the top of `app.js`. It is intentionally isolated as an ordered list of `[rank, suit]` pairs so it can later hold a complete 52-card stack.
