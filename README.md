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
- The mothership visibly recedes into space as Phase 2 begins, shrinking smoothly to a distant point so the recall action stays focused on the attacking drones. It returns at full size when the next fortress-building sector begins.
- Phase 2 cards are presented as large rank-and-suit symbols inside swept-wing stealth drones with eye lights and thrusters. Drones bank through broad, smooth zigzags at a readable pace while retaining the original vertical time-to-bottom.
- Mothership laser hits deduct 100 points and produce a large centered penalty alert. Late in their descent, drones fire one rear-facing laser at the weakest surviving fortress card for 35 damage; these heavier attacks deduct 500 points. Destroyed cards explode, and all card damage triggers a whole-screen rattle and strong red warning flash. Two visible corner turrets track every drone; a correct answer makes the nearer turret fire a green interception beam before the drone explodes into fragments.
- Sound effects use the browser's built-in audio system and begin after the first tap. Use the sound button to mute them.
- The fortress builds in a 5–5–3 layout from the bottom up. The saucer patrols horizontally and fires foreground directional beams toward individual cards on a randomized schedule, including occasional rapid double hits. Repeated hits progressively remove card corners and add scorch/crack damage. Critical cards ignite with animated flame, smoke, warning audio, a red danger glow, and an urgent repair message; the final hit creates a flash, blast ring, and fragment explosion. Each completed fortress row gains an animated metal space-station frame.
- After every sector recall round, a stack-and-sector-specific leaderboard shows the current result and the device's top three scores. Only qualifying top-three results are saved locally. A new number-one score triggers a firework and explosion celebration.

## Customize the stack

The stack constants near the top of `app.js` contain the complete 52-card Mnemonica, Redford, and Aronson orders. `STACKS` controls the choices presented on the launch screen.
