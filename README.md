# Memory Fortress prototype

A mobile-first, dependency-free prototype of the card memorization fortress game.

At launch, players choose Mnemonica, Patrick Redford's Redford Stack, or Simon Aronson's Aronson Stack. Each complete 52-card stack is trained across four sectors: 1–13, 14–26, 27–39, and 40–52.

After choosing a stack, players select Training Mode or Advanced Mode. Training shows the card answer beside the active fortress position during Phase 1. Advanced hides that answer, requiring recall from the position alone. Phase 2 drone recall is identical in both modes, and leaderboards are stored separately by stack, mode, and sector.

Before the first attack, a required three-slide walkthrough appears over the real opening game screen. The undimmed game remains clearly visible while bright labeled rings identify the active position, matching card, value button, and suit button. It explains that the fortress is under attack and demonstrates the value-first and suit-second input sequence. The walkthrough adapts to the selected stack and mode. Completion is remembered on that device, so it appears only once.

The first Drone Phase also pauses for its own required three-slide walkthrough. A live preview drone is held in view while labeled rings identify its card, the matching position control or Super Advanced keypad, and both defensive turrets. Completing this walkthrough is remembered separately on the device.

Super Advanced Mode creates two separate shuffled 52-position streams. Fortress sectors consume 13 unique positions from the build stream, while each drone round consumes 13 different positions from the drone stream. Those positions never match the positions just built. Across four sectors, each stream uses every position exactly once. Drone answers are entered through a two-digit 01–52 keypad.

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
- Mothership laser hits deduct 100 points and produce a large centered penalty alert. Late in their descent, Memory Raiders fire one rear-facing laser at the weakest surviving fortress card for 35 damage; these heavier attacks deduct 500 points. Destroyed cards explode, and all card damage triggers a whole-screen rattle and strong red warning flash. Two visible corner turrets track every Raider; a correct answer makes the nearer turret fire a green interception beam before the Raider explodes into fragments.
- Raider interception rewards decrease with descent progress: 200 points during the opening four seconds, then 150, 100, and 75 points in successive four-second windows. A compact green reward appears at the explosion, while the current combo multiplier remains visible in the enlarged top status readout.
- The combo resets to `×1` when the Raider phase begins, so fortress-building and Raider-interception streaks are scored independently.
- Fortress completion awards a build-time bonus: 1,200 points at 20 seconds or faster, then 1,000, 800, 600, 400, and 200 points across progressively slower tiers through 75 seconds. Tutorials and transition animations are excluded. The green completion panel reveals the build score, then the time bonus, then rolls the digits into the sector total like a pinball tally. Final result screens show the build time and Raider time, and saved leaderboard entries retain both times alongside their scores.
- Sound effects use the browser's built-in audio system and begin after the first tap. Use the sound button to mute them.
- The live score is centered prominently in the top status board, with phase information on the left and an enlarged combo readout on the right. The informational shield and miss counters are omitted. A wrong Phase 2 answer produces a compact red `MISS -50` alert in the open upper battlefield, lightly shakes the game, and resets the combo.
- The bottom Restart, Pause, and build-progress utility bar is removed from view. Its space is reassigned to taller suit buttons with larger symbols and easier mobile touch targets.
- A contrasting Restart button remains permanently visible beside Mute in the top-right corner. Restart returns to stack selection and then mode selection without occupying a card-input touch target. The mode screen includes a Show Tutorial toggle that forces both the build and drone tutorials to replay for that run.
- The fortress builds in a 5–5–3 layout from the bottom up. The saucer follows one uninterrupted linear patrol without stopping or teleporting, always banks and wobbles as it reverses direction at each edge, and layers randomized altitude and banking motion over each crossing without changing its horizontal timeline. It fires foreground directional beams toward individual cards on a randomized schedule, including occasional rapid double hits. Repeated hits progressively remove card corners and add scorch/crack damage. Critical cards ignite with animated flame, smoke, warning audio, a red danger glow, and an urgent repair message; the final hit creates a flash, blast ring, and fragment explosion. Each completed fortress row gains an animated metal space-station frame.
- After every sector recall round, a stack-and-sector-specific leaderboard shows the current result and the device's top three scores. Only qualifying top-three results are saved locally. A new number-one score triggers a firework and explosion celebration.
- Successful sector leaderboards offer both progression to the next sector and a secondary replay option for attempting a higher score. Replaying resets the score to that sector's original starting value while preserving the chosen stack, mode, and shuffled mission order.
- At the end of both build and recall phases, gameplay pauses for four seconds with the completed battlefield still visible while a large green centered token displays the player's current total score.
- A sector is lost if the mothership reduces the active fortress to zero built cards during Phase 1, or if Memory Raiders destroy three fortress cards during Phase 2. A large red `GAME OVER` result and a randomized defeat comment remain on screen for five seconds before a scoring report shows the player's remaining points. Defeated attempts do not replace completed leaderboard records, and the sector can be retried with the remaining score.
- The next fortress position being built displays a large glowing white two-digit number directly in its empty card space. Completed cards never regain a position-number overlay when damaged, keeping attention on the next build target.

## Customize the stack

The stack constants near the top of `app.js` contain the complete 52-card Mnemonica, Redford, and Aronson orders. `STACKS` controls the choices presented on the launch screen.
