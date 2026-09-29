import { test, expect, type Page } from "@playwright/test";
import { blocked, spots, destinations, type SceneId } from "../src/game/world";
const game = (page: Page) => page.locator(".nb-canvas");
async function pos(page: Page) {
  return (await game(page).getAttribute("data-position"))!
    .split(",")
    .map(Number);
}
async function walk(page: Page, x: number, y: number, scene: SceneId) {
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
  await game(page).focus();
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
      await page.keyboard.down(k);
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
      await page.keyboard.up(k);
      if (!reached)
        throw Error(
          `Walk stuck ${JSON.stringify(await pos(page))} toward ${JSON.stringify(target)}`,
        );
    }
  }
}
test("desktop: destinations, exits, interactions, repeated petting, outfit, focus and screenshots", async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("/");
  await expect(game(page)).toHaveAttribute("data-scene", "street");
  await page.waitForTimeout(700);
  await page.screenshot({
    path: "docs/screenshots/desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "About", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const before = await pos(page);
  await page.keyboard.down("d");
  await page.waitForTimeout(250);
  await page.keyboard.up("d");
  expect(await pos(page)).toEqual(before);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "About", exact: true }),
  ).toBeFocused();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Pet Bella" }).click();
    await expect(game(page)).toHaveAttribute("data-pet", "true");
    await page.waitForTimeout(50);
  }
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: /Switch outfit/ }).click();
    await expect(game(page)).toHaveAttribute(
      "data-outfit",
      i % 2 ? "rice" : "sweater",
    );
  }
  for (const d of destinations) {
    await walk(page, d.door.x, d.door.y, "street");
    await page.keyboard.press("e");
    await expect(game(page)).toHaveAttribute("data-scene", d.id);
    const b = (await game(page).getAttribute("data-bella"))!
      .split(",")
      .map(Number);
    expect(blocked({ x: b[0], y: b[1] }, d.id)).toBe(false);
    for (const s of spots(d.id).filter((s) => s.story)) {
      await walk(page, s.x, s.y, d.id);
      await page.keyboard.press("e");
      await expect(page.getByRole("dialog")).toBeVisible();
      if (s.id === "matcha")
        await page.screenshot({
          path: "docs/screenshots/cafe-memory.png",
          fullPage: true,
        });
      const p = await pos(page);
      await page.keyboard.down("w");
      await page.waitForTimeout(100);
      await page.keyboard.up("w");
      expect(await pos(page)).toEqual(p);
      await page.keyboard.press("Escape");
    }
    if (d.id === "trieste")
      await page.screenshot({
        path: "docs/screenshots/cafe.png",
        fullPage: true,
      });
    await walk(page, 260, 328, d.id);
    await page.keyboard.press(" ");
    await expect(game(page)).toHaveAttribute("data-scene", "street");
  }
  await page.getByRole("button", { name: "Recover to a safe spot" }).click();
  expect(await pos(page)).toEqual([440, 343]);
  await game(page).focus();
  await page.keyboard.down("d");
  await page.waitForTimeout(100);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const p = await pos(page);
  await page.waitForTimeout(150);
  expect(await pos(page)).toEqual(p);
  await page.keyboard.up("d");
  expect(errors).toEqual([]);
});
test("mobile: touch movement, simultaneous petting, panels, safe layout", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(game(page)).toHaveAttribute("data-scene", "street");
  await page.waitForTimeout(400);
  await page.screenshot({
    path: "docs/screenshots/mobile.png",
    fullPage: true,
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  const button = page.getByRole("button", { name: "Move right" }),
    pet = page.getByRole("button", { name: "Pet Bella" });
  await button.scrollIntoViewIfNeeded();
  const a = (await button.boundingBox())!,
    b = (await pet.boundingBox())!;
  const session = await context.newCDPSession(page);
  const p = await pos(page);
  const scroll = await page.evaluate(() => scrollY);
  const one = { x: a.x + a.width / 2, y: a.y + a.height / 2, id: 1 },
    two = { x: b.x + b.width / 2, y: b.y + b.height / 2, id: 2 };
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [one],
  });
  await page.waitForTimeout(150);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [one, two],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [one],
  });
  await expect(game(page)).toHaveAttribute("data-pet", "true");
  await page.waitForTimeout(150);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect((await pos(page))[0]).toBeGreaterThan(p[0] + 10);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  const upBox = (await page
      .getByRole("button", { name: "Move up" })
      .boundingBox())!,
    interactBox = (await page
      .getByRole("button", { name: "Interact", exact: false })
      .boundingBox())!;
  const upTouch = {
      x: upBox.x + upBox.width / 2,
      y: upBox.y + upBox.height / 2,
      id: 3,
    },
    interactTouch = {
      x: interactBox.x + interactBox.width / 2,
      y: interactBox.y + interactBox.height / 2,
      id: 4,
    };
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [upTouch],
  });
  await page.waitForTimeout(470);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [upTouch, interactTouch],
  });
  await expect(game(page)).toHaveAttribute("data-scene", "trieste");
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.screenshot({
    path: "docs/screenshots/mobile-cafe.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Projects", exact: true }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/mobile-portfolio.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Close panel" }).tap();
  await context.close();
});
test("preferences survive refresh and denied/corrupt storage, canvas failure has fallback", async ({
  page,
}) => {
  await page.goto("/");
  await expect(game(page)).toHaveAttribute("data-outfit", "rice");
  await page.getByRole("button", { name: /Switch outfit/ }).click();
  await page.getByRole("button", { name: "Enable sound" }).click();
  await page.reload();
  await expect(game(page)).toHaveAttribute("data-outfit", "sweater");
  await expect(page.getByRole("button", { name: "Mute sound" })).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("north-beach-preferences", "{broken"),
  );
  await page.reload();
  await expect(game(page)).toHaveAttribute("data-outfit", "rice");
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage unavailable", "SecurityError");
      },
    }),
  );
  await page.reload();
  await expect(game(page)).toHaveAttribute("data-scene", "street");
  await page.getByRole("button", { name: /Switch outfit/ }).click();
  await expect(game(page)).toHaveAttribute("data-outfit", "sweater");
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.reload();
  await expect(page.getByText("A quiet morning, off canvas.")).toBeVisible();
  await page.getByRole("button", { name: "Contact", exact: false }).click();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "mg188@rice.edu" }),
  ).toBeVisible();
});
test("the complete non-game portfolio works with JavaScript disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/portfolio.html");
  await expect(
    page.getByRole("heading", { name: "Michael Gonzalez McNeil", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "mg188@rice.edu" }),
  ).toHaveAttribute("href", "mailto:mg188@rice.edu");
  await expect(
    page.locator("#memories").getByText("My usual kind of pause"),
  ).toBeVisible();
  await context.close();
});

test("resizing and reduced motion keep the canvas usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(game(page)).toHaveAttribute("data-scene", "street");
  await page.setViewportSize({ width: 820, height: 620 });
  await page.waitForTimeout(200);
  expect(
    await game(page).evaluate((canvas) => {
      const c = canvas as HTMLCanvasElement;
      const data = c
        .getContext("2d")!
        .getImageData(0, 0, c.width, c.height).data;
      const colors = new Set();
      for (let i = 0; i < data.length; i += 128)
        colors.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
      return colors.size;
    }),
  ).toBeGreaterThan(20);
  await page.getByRole("button", { name: "Open neighborhood guide" }).click();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open neighborhood guide" }),
  ).toBeFocused();
});
