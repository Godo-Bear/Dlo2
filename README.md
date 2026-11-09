# Hoop Chaos

One-button ragdoll basketball for the browser: original characters, mutator cards, living courts,
trick shots with slow-mo replays, Horse/Trick mode, an 8-team tournament and boss battles.

## Play
Open `index.html` in a browser (Matter.js loads from a CDN, so you need internet), or visit the
Cloudflare Workers deployment.

- **Player 1:** `W`  **Player 2:** `Up Arrow`  (touch buttons on mobile)
- Hold = crouch / wind up. Release = jump and swing arms.
- Holding the ball? Jump, then tap again near the top of the jump to shoot.
- `Esc` / `P` = pause.

## Code
| File | What |
|---|---|
| `js/config.js` | **All tuning values** (jump force, gravity, arm swing, boss health...) |
| `js/physics.js` | Matter.js world, hoops (wobbling rim, swinging net), balls |
| `js/players.js` | Ragdoll players, characters, CPU, character drawing |
| `js/tricks.js` | Trick-shot detection, combo labels, replay recorder |
| `js/mutators.js` | Mutator cards (`apply`/`remove` objects) |
| `js/courts.js` | Living courts (one config object each) |
| `js/modes.js` | Match engine, Hot Potato, Horse mode, Tournament |
| `js/bosses.js` | Boss battles and special moves |
| `js/ui.js` | HUD, effects, menus |
| `js/audio.js` | Synthesized Web Audio sounds |
| `js/main.js` | Input, game loop, screens, saving |

## Deploy (Cloudflare Workers)
`wrangler.jsonc` serves the repo root as static assets. Make sure its `name` matches your Worker.
