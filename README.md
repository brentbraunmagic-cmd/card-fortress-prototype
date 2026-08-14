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
- The fortress builds in a 5–5–3 layout from the bottom up. The saucer patrols horizontally and fires foreground directional beams toward individual cards on a randomized schedule, including occasional rapid double hits. Repeated hits progressively remove card corners and add scorch/crack damage. Critical cards ignite with animated flame, smoke, warning audio, a red danger glow, and an urgent repair message; the final hit creates a flash, blast ring, and fragment explosion. Each completed fortress row gains an animated metal space-station frame.
- After every sector recall round, a stack-and-sector-specific leaderboard shows the current result and the device's top three scores. Only qualifying top-three results are saved locally. A new number-one score triggers a firework and explosion celebration.

## Customize the stack

The stack constants near the top of `app.js` contain the complete 52-card Mnemonica, Redford, and Aronson orders. `STACKS` controls the choices presented on the launch screen.
