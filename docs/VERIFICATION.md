# Verification

Verified locally on September 29, 2026, using Node 24 and Playwright Chromium against the Vite production build.

## Build and simulation

- `npm run build`: TypeScript check and Vite build succeeded. No missing imports/assets. Vite reports the documented Phaser chunk-size warning.
- `npm test`: six unit tests passed, including wall/headroom bounds.
- A breadth-first reachability test checks every outdoor doorway and optional interaction.
- Each interior’s stories, spawn and exit are reachable; every outdoor return position is collision-free.
- Large displacement cannot tunnel through a building, and diagonal speed matches horizontal speed.
- Bella follows a collision-checked path through turns without crossing obstacles, and resets safely.
- Missing, corrupt, malformed and throwing storage reads/writes do not crash the preferences module.

## Browser behavior

Ten Playwright browser tests passed:

1. **Desktop, 1440 × 1050:** keyboard walk to all four destinations, enter each interior, inspect every interior story, exit each room, and recover to the starting position. Repeated petting and outfit switching work. Dialogue prevents movement, Escape restores focus, and blur releases held movement. This complete tour recorded no page exceptions or HTTP asset errors.
2. **Mobile, 390 × 844 at 2×:** actual Chromium multitouch events hold movement while a second finger pets Bella, then hold movement while a second finger enters Trieste. Controls do not scroll the page. Portfolio panels open and close, and the layout has no horizontal overflow.
3. **Preferences and failures:** outfit and sound preferences survive refresh; corrupt and denied localStorage remain usable; a forced canvas-context failure exposes the non-game fallback and contact panel.
4. **No JavaScript:** the standalone portfolio retains headings, contact, and memory text with scripting disabled.
5. **Resize / reduced motion:** the rendered world remains usable after a viewport change to 820 × 620 with reduced motion enabled; the guide opens and Escape restores its trigger’s focus.

6. **Keyboard focus and modal gestures:** WASD/arrows and petting remain usable after portfolio focus restoration; a click inside dialog padding stays open, while a fresh backdrop click closes it. Door prompts survive petting.
7. **Slow loading:** opening About before the game module arrives initializes the world paused.
8. **Landscape phone, 844 × 390:** touch controls remain visible and usable; cancellation stops movement; the instruction card avoids the player at the bottom camera edge; rotation clears held movement.
9. **Tablet, 820 × 1180:** touch controls and cancellation work, with no scrolling during the gesture; rotation leaves no held input.
10. **Complete mobile touch tour, 390 × 844:** enter and exit all four interiors, inspect every interior and optional outdoor object, close dialogue, pet Bella, change outfit, open all portfolio panels, and refresh. Sampled character positions stay navigable, and Bella stays within 30 world pixels of Michael throughout. No page exceptions or asset errors were recorded.

See [the playtest fix report](PLAYTEST.md) for reproduced problems and changes.

Desktop, café, memory dialogue, mobile, mobile café and mobile portfolio screenshots were opened and visually inspected. That review prompted fixes for character overlap at spawn, mobile control sizing, text contrast, and immediate camera centering at scene entry.

## Screenshots

- [Desktop neighborhood](screenshots/desktop.png)
- [Café interior](screenshots/cafe.png)
- [Confirmed matcha memory](screenshots/cafe-memory.png)
- [Mobile neighborhood](screenshots/mobile.png)
- [Mobile café](screenshots/mobile-cafe.png)
- [Mobile portfolio panel](screenshots/mobile-portfolio.png)
- [Back wall after the collision fix](screenshots/playtest-wall.png)
- [Bottom-edge prompt after phone rotation](screenshots/playtest-rotation-844.png)
- [Controls after tablet rotation](screenshots/playtest-rotation-820.png)

## Scope limits

These are Chromium browser checks on macOS, including mobile emulation. Physical iOS/Android devices, Safari, Firefox, and screen-reader audio have not been tested. Native HTML dialogue provides modal focus containment; keyboard focus and restoration were checked, but no claim of a complete accessibility audit is made. The audio toggle and persistence were tested; sound quality was not evaluated by listening.

No public site deployment was performed.
