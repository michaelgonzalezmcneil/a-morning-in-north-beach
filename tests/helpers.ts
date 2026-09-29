import type { Page, CDPSession } from "@playwright/test";
import { blocked, type SceneId } from "../src/game/world";
export const game = (page: Page) => page.locator(".nb-canvas");
export async function pos(page: Page) {
  return (await game(page).getAttribute("data-position"))!
    .split(",")
    .map(Number);
}
export async function walk(
  page: Page,
  x: number,
  y: number,
  scene: SceneId,
  input: "keyboard" | "touch" = "keyboard",
) {
  const [sx, sy] = await pos(page),
    step = 8,
    start = {
      x: Math.round(sx / step) * step,
      y: Math.round(sy / step) * step,
    };
  const key = (p: { x: number; y: number }) => `${p.x},${p.y}`;
  const q = [start],
    parent = new Map<string, { x: number; y: number } | null>([
      [key(start), null],
    ]);
  let end;
  for (let i = 0; i < q.length; i++) {
    const p = q[i];
    if (Math.hypot(p.x - x, p.y - y) < 10) {
      end = p;
      break;
    }
    for (const [dx, dy] of [
      [step, 0],
      [-step, 0],
      [0, step],
      [0, -step],
    ]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (!blocked(n, scene, 14) && !parent.has(key(n))) {
        parent.set(key(n), p);
        q.push(n);
      }
    }
  }
  if (!end) throw Error(`No path ${scene} ${x},${y}`);
  const route = [];
  while (end) {
    route.unshift(end);
    end = parent.get(key(end)) || undefined;
  }
  const corners = route.filter(
    (p, i) =>
      i === 0 ||
      i === route.length - 1 ||
      (route[i - 1].x !== route[i + 1].x && route[i - 1].y !== route[i + 1].y),
  );
  let session: CDPSession | undefined;
  if (input === "keyboard") await game(page).focus();
  else {
    await page
      .locator(".nb-world-section")
      .evaluate((e) => e.scrollIntoView({ block: "start" }));
    session = await page.context().newCDPSession(page);
  }
  for (const target of corners) {
    for (const axis of [0, 1]) {
      const current = await pos(page),
        delta = (axis ? target.y : target.x) - current[axis];
      if (Math.abs(delta) < 4) continue;
      const k = axis
        ? delta > 0
          ? "ArrowDown"
          : "ArrowUp"
        : delta > 0
          ? "ArrowRight"
          : "ArrowLeft";
      if (session) {
        const button = page.getByRole("button", {
          name: `Move ${k.replace("Arrow", "").toLowerCase()}`,
        });
        const b = (await button.boundingBox())!;
        await session.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2, id: 1 }],
        });
      } else await page.keyboard.down(k);
      let reached = false;
      for (let i = 0; i < 250; i++) {
        await page.waitForTimeout(25);
        const p = await pos(page);
        const remaining = (axis ? target.y : target.x) - p[axis];
        if (
          Math.abs(remaining) < 4 ||
          Math.sign(remaining) !== Math.sign(delta)
        ) {
          reached = true;
          break;
        }
      }
      if (session)
        await session.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      else await page.keyboard.up(k);
      if (!reached)
        throw Error(
          `Walk stuck ${JSON.stringify(await pos(page))} toward ${JSON.stringify(target)}`,
        );
    }
  }
  await session?.detach();
}
