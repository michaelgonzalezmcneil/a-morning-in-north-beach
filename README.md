# A Morning in North Beach

A complete, free-roaming pixel-art portfolio for **Michael Gonzalez McNeil**, with his long-haired Chihuahua, Bella. Four destinations, four playable interiors, short optional stories, and an accessible HTML portfolio. No backend, account, analytics, or API keys.

## Run locally

Use **Node 24+** (the content generator and unit tests use Node’s native TypeScript stripping).

```sh
npm ci
npm run dev
```

Production:

```sh
npm run build
npm run preview
```

Serve the generated `dist/` directory with any static host. Both `index.html` and `portfolio.html` are real entry points. Relative asset URLs support subdirectories. No SPA rewrite is needed. The game is lazy-loaded separately from the React interface; the non-game page needs no JavaScript. Nothing is automatically deployed.

## Controls

- Walk: WASD / arrows; on mobile, hold a direction button.
- Interact: E / Space / Interact, near a glowing marker.
- Pet Bella: P / Pet Bella; repeat as often as you like.
- Escape closes dialogue and portfolio panels.
- Shirt button alternates Rice T-shirt and rust henley.
- Speaker toggles the optional petting chime. Default is off; playback requires a user action.
- Circular arrow returns both characters to a safe position in the current scene.

Movement pauses behind modal panels. Touch direction and action buttons support separate simultaneous pointers. Blur and scene changes reset movement. Reduced motion follows the operating-system preference.

## Architecture

| File                      | Responsibility                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/game/world.ts`       | Outdoor geometry, collision rectangles, destinations, doorways, interior objects and safe spawns |
| `src/game/movement.ts`    | Normalized speed and collision substeps with wall sliding                                        |
| `src/game/companion.ts`   | A queue of actual safe player positions; Bella follows turns without shortcuts                   |
| `src/game/engine.ts`      | Phaser lifecycle, canvas texture, input, camera bounds, transitions and recovery                 |
| `src/game/render.ts`      | Original pixel drawing functions, Michael, Bella, storefronts, interiors and fog                 |
| `src/game/Experience.tsx` | Accessible React controls, native modal dialogue, focus restoration and preferences              |
| `src/game/content.ts`     | Typed stories with `confirmed`, `fictional-draft`, or `game-detail` status                       |
| `src/game/config.ts`      | Character palette, verified contact and optional portfolio links                                 |
| `src/game/Portfolio.tsx`  | In-game portfolio panels                                                                         |
| `portfolio.html`          | Independent, fully static portfolio                                                              |
| `scripts/content.mjs`     | Generates static memories from the typed content source before dev/build                         |

Phaser owns the game loop and displays a procedural CanvasTexture. All artwork is bundled as drawing code. The simulation is separate from rendering and UI. A smaller logical pixel viewport follows the player on mobile; a bounded camera shows more of the neighborhood on desktop.

## Edit the content

**Memories:** edit `src/game/content.ts`. Keep each story’s explicit status. City Lights, Jack Kerouac Alley, and Telegraph Hill are imagined drafts for review. Trieste’s matcha order is a confirmed personal recollection, not a menu claim. `npm run dev` and `npm run build` regenerate the static memory section. Do not edit the generated `#memory-list` directly.

**Michael:** change colors in `appearance.michael` in `src/game/config.ts`; change sprite geometry, walking frames and the portrait in `src/game/render.ts`. The default uses plain RICE lettering, with no university logo.

**Bella:** change `appearance.bella` in `src/game/config.ts`. Her current honey/cream coat is provisional. Size, fur silhouette, four-direction walking and wagging are in `bella()` in `render.ts`. Follow/rest gaps, idle timing and pet duration are in `companion.ts`. See [Bella’s behavior and checks](docs/BELLA.md).

**Portfolio:** the existing workspace supplied `mg188@rice.edu`. Update `portfolio.email` and `portfolio.links` in `config.ts`, and the contact section of `portfolio.html` so the JavaScript-free version stays current. Only verified HTTPS links are shown in the React panel. Add verified biography/project details in `Portfolio.tsx` and `portfolio.html`. Missing résumé, social and public RiceWalk links are intentionally omitted.

**World:** edit `world.ts` and the matching drawing functions in `render.ts` together. Run reachability tests whenever changing obstacles or door positions.

## Verification

```sh
npm test
npx playwright install chromium
npm run build
npm run test:browser
```

Unit tests check reachability, exits, return spawns, collision tunnelling, diagonal speed, companion turns, and bad storage. Browser tests drive real keyboard input and Chromium touch events against the production build. Screenshots are written to `docs/screenshots/`. See [Bella’s latest checks](docs/BELLA.md) and the [original verification notes](docs/VERIFICATION.md) for the performed checks and limitations. See the [first-time playtest report](docs/PLAYTEST.md) for reproduced issues and fixes.

## Geographic and creative boundaries

This is a **stylized interpretation**, not a navigation map. City Lights and Vesuvio share the alley; Trieste is farther north; Coit Tower is northeast on Telegraph Hill. Distances are compressed. Interiors are original interpretations. Morning access to Vesuvio is game fiction. Bella’s role in the game does not claim she attended every real visit.

See [credits and geographic references](docs/CREDITS.md).

## Remaining content and limitations

- Bella’s actual coat color still needs confirmation.
- Three personal vignettes remain clearly labeled fictional drafts.
- Degree, major, employers, internship dates, résumé, achievements and public project/social links have not been supplied.
- This is a compact artistic neighborhood, with no real route guidance or business-hours information.
- The Phaser chunk is about 1.2 MB before gzip (~332 KB gzipped). Vite reports its standard size warning; it is lazy-loaded and all assets remain local.
- Audio is a small generated interaction chime, not a recorded neighborhood soundscape.
- Automated mobile testing uses Chromium touch emulation; physical iOS/Android devices are not yet tested.

The original RiceWalk workspace remains separate and preserved. This repository contains only North Beach.
