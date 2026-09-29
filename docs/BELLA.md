# Bella: a quiet companion

## Behavior

Bella follows Michael's actual collision-checked movement substeps. The player movement helper emits each accepted horizontal/vertical substep; the companion consumes that trail in short increments. This preserves the route around corners, including diagonal wall slides. She is never part of player collision detection.

The companion has five pose states: follow, watch, sniff, settled and pet. Walking frames advance with distance traveled. Four directional poses, a soft one-pixel bounce and a feathered tail make turns legible. A small facing dead band avoids switching between axes at every diagonal step.

The following gap is 22 trail pixels. At rest she eases toward 15 pixels, looks toward Michael, and occasionally lowers her nose for 1.1 seconds. The first sniff follows about 6.5 quiet seconds; later intervals vary between 8 and 12 seconds. Sniffing changes her pose at her current safe position. It creates no extra navigation targets.

Sitting settles Bella at her current position while dialogue is open. After closing the dialogue, she finishes approaching and remains settled until Michael walks. All simulation and animation clocks freeze while reading. Opening a panel clears an active pet effect. Movement, transitions and recovery immediately take priority over idles; transitions discard the old trail and choose a collision-checked nearby spawn.

Petting lasts 1.2 seconds and restarts reliably. Michael turns toward Bella and reaches for the first half-second; Bella wags and a single small heart appears. Movement remains available. Rapid repeated pets share a 650ms chime cooldown, preventing stacked audio. No barking or automatic idle sounds were added.

Reduced motion disables cosmetic gait/bounce, sniffing, wagging and heart travel. Petting uses a static gesture and heart; essential following and facing still work. Audio remains optional and off by default.

## Editing

- `src/game/companion.ts`: follow/rest gaps, sniff timing, five-state behavior and `PET_DURATION`.
- `src/game/movement.ts`: optional accepted-substep callback, shared by player movement and companion route recording.
- `src/game/render.ts`: four-direction sprites, coat tufts, stride, pet gesture and heart.
- `src/game/config.ts`: Bella's provisional honey/cream coat colors.
- `src/game/Experience.tsx`: optional chime and its repeat cooldown.

## Verification

`npm run build` succeeds (the existing Phaser chunk-size warning remains). All 9 unit tests and all 12 browser checks passed. After the final directional pet gesture refinement, the 3 affected companion/reduced-motion/audio/mobile tests were rerun and passed. The complete desktop and mobile tours reported no page exceptions or HTTP asset errors. Desktop walking, sniffing, petting and settled screenshots and the mobile café capture were visually inspected.

Regression coverage includes diagonal wall slides, tight turns, reversals shorter than the following gap, bounded trails, smooth stopping, stationary idles, settled behavior, repeated pets, reduced motion and reset positions in all four interiors and at their outdoor doorways.

Browser coverage exercises four walking directions, visible stride changes, sniff/watch transitions, repeated pets, dialogue pause, sitting and resuming movement. It compares rendered frames under reduced motion and counts actual Web Audio oscillator creation to verify mute and repeat suppression. The existing full desktop and mobile touch tours check all destinations, interior exits, sampled player/Bella collisions, portfolio access, refresh and storage failures.

Screenshots include `bella-walk-0.png` through `bella-walk-3.png`, `bella-sniff.png`, `bella-pet.png` and `bella-settled.png` in `docs/screenshots/`.

Physical iOS/Android devices, Safari and Firefox were not tested. The audio checks verify scheduling and settings, not subjective loudness on speakers.
