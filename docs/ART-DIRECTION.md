# Art-direction pass

## Five issues found in the initial desktop and mobile screenshots

1. **Repeated storefronts:** all three shops used nearly identical windows and trim. Added café window cups and espresso signage, book-filled displays and a vertical BOOKS sign, and Vesuvio's decorative joinery and colored glass.
2. **Flat, sparse interiors:** added paneled café cabinetry, espresso details, steaming drinks, pendant lights and window light; bookcase bindings and shelf plaques; deeper walnut and burgundy tones, framed art and a patterned rug at Vesuvio. Furniture footprints stay the same.
3. **Mixed pixel treatment and small text:** replaced antialiased canvas text with original 3×5 bitmap lettering, rasterized diagonal road edges and elliptical effects onto the logical pixel grid, enlarged key signs, and made portrait pixels consistent. Responsive canvas scaling remains nearest-neighbor, so physical pixel widths can vary at fractional browser zoom.
4. **Indistinct characters:** refined the Rice tee's lettering and sleeves; gave the rust henley a placket, buttons and longer sleeves; added Bella's cheek fringe, chest ruff and feathered tail. The stored `sweater` preference key remains compatible and now selects the henley. Honey/cream remains a provisional coat palette.
5. **Weak lookout payoff:** expanded the panorama within the existing observation wall, adding layered hills, bay reflections, a sailboat, a bridge silhouette and waterfront roofs. Slatted benches replace the generic tables.

Fog opacity is reduced. The outdoor map remains 900×650 and every interior remains 520×390. Geography, collision data, door positions, story statuses and interpretation labels are unchanged. The panorama and shopfront ornament are original artistic interpretations.

## Verification

`npm run build` succeeded, with the existing Phaser chunk-size warning. `npm test` passed all 6 tests. All 10 existing browser checks passed against the final artwork: 9 in the full run and the desktop tour on rerun after fixing a capture-script race with the resize input reset. Both complete journeys recorded no page exceptions or HTTP asset errors. The screenshot tour now captures every interior at desktop and 390px mobile layouts, plus the henley. See `docs/screenshots/` for the resulting images. Mobile layout captures in the desktop tour use keyboard navigation; the separate complete mobile tour uses emulated touch input.

No external assets or new dependencies were added. See `CREDITS.md`. Physical devices, Safari and Firefox are not verified in this pass.

Inspected the resulting desktop neighborhood, all four desktop interiors, all four 390px interior layouts, touch café capture, and henley portrait. The phone camera shows a portion of each room and follows the player; distant scenery labels can be clipped at the viewport edge, while essential prompts and dialogue remain HTML outside that scrolling world.

## Selected screenshots

- [Neighborhood](screenshots/desktop.png)
- [Trieste](screenshots/cafe.png)
- [City Lights](screenshots/books.png)
- [Vesuvio](screenshots/vesuvio.png)
- [Bay panorama](screenshots/tower.png)
- [Phone café](screenshots/art-mobile-trieste.png)
- [Phone lookout](screenshots/art-mobile-tower.png)
- [Henley](screenshots/henley.png)
