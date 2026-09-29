# First-time playtest and fixes

This pass preserves the existing artwork, destinations, story content and game scope.

## Reproduced issues and changes

| Trigger                                                             | Problem                                                                                                    | Fix                                                                                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Read About, close with Escape, then walk                            | Restored button focus swallowed movement keys.                                                             | Movement and letter shortcuts work from controls; Space retains native button activation.                                   |
| Use a landscape phone or wider tablet                               | Touch controls disappeared beyond the phone-width breakpoint.                                              | The existing touch layout also responds to coarse pointers. Short screens keep the canvas and controls together.            |
| Walk up the side of a room toward its back wall                     | Michael’s head crossed outside the room and Bella followed into the wall artwork.                          | Collision bounds account for the avatar’s feet-based origin and sprite height. Outdoor top-edge clipping is also prevented. |
| Pet Bella near a door                                               | The pet message replaced the instruction to enter.                                                         | Nearby object/door instructions take priority in the existing prompt card.                                                  |
| Walk to the bottom camera edge                                      | The bottom prompt covered Michael’s body.                                                                  | That same card moves to the top when needed, temporarily replacing the decorative location caption.                         |
| Tap an object on touch                                              | The story opened on pointer-down, then its opening gesture’s release could dismiss it as a backdrop click. | Backdrop dismissal requires a fresh gesture that actually began outside the dialog.                                         |
| Open a portfolio panel before the lazy game module finishes loading | The newly created game did not inherit the panel’s paused state.                                           | Initialization reads the current modal state.                                                                               |
| Rotate/resize while a direction is held                             | Old input/camera state could carry into the resized view.                                                  | Resizing resets held input and immediately clamps the camera to the new viewport.                                           |

## Regression coverage

- Shared route helpers drive real keyboard or Chromium touch input; they do not teleport the character.
- The touch tour visits all four interiors and all their objects, plus the optional outdoor notes, then checks petting, outfit changes, portfolio panels and refresh.
- A browser trace samples Michael and Bella throughout that route and checks that both remain in navigable space.
- Dedicated checks cover focus restoration, slow game loading, pointer cancellation, rotation, short-screen controls, wall headroom and instruction placement.
- The existing recovery assertion now waits for the rendered position to update rather than reading a stale frame immediately after a click.

## Limits

Touch tests use Chromium emulation. Physical iOS/Android devices, Safari, Firefox, screen-reader output and audible sound quality are not verified in this pass. Chromium’s screenshot operation clears touch emulation in this environment, so touch-gesture checks precede captures, and capture verification uses phone-width layouts that remain stable during that tool behavior.
