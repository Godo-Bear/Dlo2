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
| `js/auth.js` | Accounts + login page (online via the Worker, or on-device) |
| `js/main.js` | Input, game loop, screens, saving |
| `worker.js` | Cloudflare Worker: serves the game + `/api` for online accounts |

## Game time limit
Settings → **Game Time Limit** (or the TIME LIMIT button before a match): Off, 1, 2, 3, 5 or 10 minutes.
When time runs out the leader wins; a tie goes to overtime where the next basket wins.
Applies to Quick Match, Hot Potato and Tournament. The default is `MATCH_TIME` in `js/config.js`.

## Accounts / saving progress
The game opens with a login page (log in, create an account, or play as a guest).
- **Online accounts** (any device): need a Workers KV namespace - see below.
- **Without KV** (or when opening `index.html` directly) accounts are stored on that device only.
- Creating an account keeps any progress you made as a guest.

## Deploy (Cloudflare Workers)
`wrangler.jsonc` serves the repo as static assets and runs `worker.js` for `/api/*`.
1. Make sure `name` in `wrangler.jsonc` matches your Worker.
2. To turn on online accounts: Cloudflare dashboard → Storage & Databases → Workers KV → Create
   (e.g. `hoopchaos-saves`), copy its ID, and uncomment the `kv_namespaces` line in `wrangler.jsonc`
   with that ID (binding name must stay `SAVES`). Push, and the next deploy picks it up.
