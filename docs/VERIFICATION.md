# Verification

Verified locally on September 29, 2026, using Node 24 and Playwright Chromium against the Vite production build.

## Build and simulation

- `npm run build`: TypeScript check and Vite build succeeded. No missing imports/assets. Vite reports the documented Phaser chunk-size warning.
- `npm test`: five unit tests passed.
- A breadth-first reachability test checks every outdoor doorway and optional interaction.
- Each interior’s stories, spawn and exit are reachable; every outdoor return position is collision-free.
- Large displacement cannot tunnel through a building, and diagonal speed matches horizontal speed.
- Bella follows a collision-checked path through turns without crossing obstacles, and resets safely.
- Missing, corrupt, malformed and throwing storage reads/writes do not crash the preferences module.

## Browser behavior

Five Playwright browser tests passed:

1. **Desktop, 1440 × 1050:** keyboard walk to all four destinations, enter each interior, inspect every interior story, exit each room, and recover to the starting position. Repeated petting and outfit switching work. Dialogue prevents movement, Escape restores focus, and blur releases held movement. This complete tour recorded no page exceptions or HTTP asset errors.
2. **Mobile, 390 × 844 at 2×:** actual Chromium multitouch events hold movement while a second finger pets Bella, then hold movement while a second finger enters Trieste. Controls do not scroll the page. Portfolio panels open and close, and the layout has no horizontal overflow.
3. **Preferences and failures:** outfit and sound preferences survive refresh; corrupt and denied localStorage remain usable; a forced canvas-context failure exposes the non-game fallback and contact panel.
4. **No JavaScript:** the standalone portfolio retains headings, contact, and memory text with scripting disabled.
5. **Resize / reduced motion:** the rendered world remains usable after a viewport change to 820 × 620 with reduced motion enabled; the guide opens and Escape restores its trigger’s focus.

Desktop, café, memory dialogue, mobile, mobile café and mobile portfolio screenshots were opened and visually inspected. That review prompted fixes for character overlap at spawn, mobile control sizing, text contrast, and immediate camera centering at scene entry.

## Screenshots

- [Desktop neighborhood](screenshots/desktop.png)
- [Café interior](screenshots/cafe.png)
- [Confirmed matcha memory](screenshots/cafe-memory.png)
- [Mobile neighborhood](screenshots/mobile.png)
- [Mobile café](screenshots/mobile-cafe.png)
- [Mobile portfolio panel](screenshots/mobile-portfolio.png)

## Scope limits

These are Chromium browser checks on macOS, including mobile emulation. Physical iOS/Android devices, Safari, Firefox, and screen-reader audio have not been tested. Native HTML dialogue provides modal focus containment; keyboard focus and restoration were checked, but no claim of a complete accessibility audit is made. The audio toggle and persistence were tested; sound quality was not evaluated by listening.

No public site deployment was performed.
