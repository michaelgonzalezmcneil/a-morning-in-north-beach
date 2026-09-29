import { test, expect } from "@playwright/test";
import { game, pos, walk } from "./helpers";
import { blocked, destinations, spots, type SceneId } from "../src/game/world";
import { stories } from "../src/game/content";

test("letter shortcuts keep working after reading portfolio panels; petting never hides a doorway", async ({
  page,
}) => {
  await page.goto("/");
  await expect(game(page)).toHaveAttribute("data-scene", "street");
  for (const [panel, heading] of [
    ["About", "Michael Gonzalez McNeil"],
    ["Projects", "Small worlds, made for the web."],
    ["Contact", "Let’s start a conversation."],
  ]) {
    const button = page.getByRole("button", { name: panel, exact: true });
    await button.click();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    if (panel === "About") {
      const bounds = (await page.getByRole("dialog").boundingBox())!;
      await page.mouse.click(bounds.x + 2, bounds.y + 2);
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.mouse.click(2, 2);
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await button.click();
    }
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    const before = await pos(page);
    const key = panel === "Projects" ? "ArrowRight" : "d";
    await page.keyboard.down(key);
    await page.waitForTimeout(150);
    await page.keyboard.up(key);
    expect((await pos(page))[0]).toBeGreaterThan(before[0] + 5);
    await page.keyboard.press("p");
    await expect(game(page)).toHaveAttribute("data-pet", "true");
  }
  await walk(page, 465, 296, "street");
  await page.getByRole("button", { name: "Pet Bella" }).click();
  await expect(page.locator(".nb-prompt")).toContainText("Enter Caffè Trieste");
  await page.getByRole("button", { name: "Interact", exact: false }).focus();
  await page.keyboard.press("e");
  await expect(game(page)).toHaveAttribute("data-scene", "trieste");
  await walk(page, 53, 111, "trieste");
  await page.keyboard.down("w");
  await page.waitForTimeout(900);
  await page.keyboard.up("w");
  expect((await pos(page))[1]).toBeGreaterThanOrEqual(104);
  await page.screenshot({
    path: "docs/screenshots/playtest-wall.png",
    fullPage: true,
  });
});

test("portfolio opened before the game loads still pauses the new game", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(/\/assets\/engine-[^/]+\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "About", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  release();
  await expect(game(page)).toHaveAttribute("data-paused", "true");
  await page.keyboard.press("Escape");
  await expect(game(page)).toHaveAttribute("data-paused", "false");
});

for (const viewport of [
  { width: 844, height: 390 },
  { width: 820, height: 1180 },
]) {
  test(`touch controls work at ${viewport.width}×${viewport.height}, including pointer cancellation`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(game(page)).toHaveAttribute("data-scene", "street");
    await page
      .locator(".nb-world-section")
      .evaluate((e) => e.scrollIntoView({ block: "start" }));
    const right = page.getByRole("button", { name: "Move right" });
    await expect(right).toBeVisible();
    const b = (await right.boundingBox())!;
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(44);
    expect(b.y + b.height).toBeLessThanOrEqual(viewport.height);
    const session = await context.newCDPSession(page),
      before = await pos(page),
      scroll = await page.evaluate(() => scrollY);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2, id: 1 }],
    });
    await page.waitForTimeout(180);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    });
    expect((await pos(page))[0]).toBeGreaterThan(before[0] + 5);
    const stopped = await pos(page);
    await page.waitForTimeout(150);
    expect(await pos(page)).toEqual(stopped);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);

    if (viewport.height < 500) {
      await walk(page, 440, 623, "street", "touch");
      await expect(game(page)).toHaveAttribute("data-prompt-top", "true");
      const world = (await page.locator(".nb-world").boundingBox())!;
      const prompt = (await page.locator(".nb-prompt").boundingBox())!;
      expect(prompt.y + prompt.height).toBeLessThan(world.y + world.height / 2);
    }
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2, id: 2 }],
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    const resized = await pos(page);
    await page.waitForTimeout(150);
    expect(await pos(page)).toEqual(resized);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    // Capture after gestures: this Chromium build clears touch emulation
    // during screenshots. At phone width the layout remains identical.
    await page.screenshot({
      path: `docs/screenshots/playtest-rotation-${viewport.width}.png`,
      fullPage: true,
    });
    await context.close();
  });
}

test("full mobile touch tour: all doors and objects, dialogue, Bella, outfits, portfolio and refresh", async ({
  browser,
}) => {
  test.setTimeout(240000);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("/");
  await expect(game(page)).toHaveAttribute("data-scene", "street");
  await page.evaluate(() => {
    const trace: number[][] = [];
    Object.assign(window, { playtestTrace: trace });
    const ids = ["street", "trieste", "books", "vesuvio", "tower"];
    const record = () => {
      const c = document.querySelector<HTMLCanvasElement>(".nb-canvas");
      if (c?.dataset.position && trace.length < 20000) {
        trace.push([
          ids.indexOf(c.dataset.scene!),
          ...c.dataset.position.split(",").map(Number),
          ...c.dataset.bella!.split(",").map(Number),
        ]);
      }
      requestAnimationFrame(record);
    };
    record();
  });
  for (const d of destinations) {
    await walk(page, d.door.x, d.door.y, "street", "touch");
    await page.getByRole("button", { name: "Interact", exact: false }).tap();
    await expect(game(page)).toHaveAttribute("data-scene", d.id);
    for (const s of spots(d.id).filter((s) => s.story)) {
      await walk(page, s.x, s.y, d.id, "touch");
      await page.getByRole("button", { name: "Interact", exact: false }).tap();
      await expect(
        page
          .getByRole("dialog")
          .getByRole("heading", { name: stories[s.story!].title }),
      ).toBeVisible();
      const paused = await pos(page);
      await page.waitForTimeout(120);
      expect(await pos(page)).toEqual(paused);
      await page.getByRole("button", { name: "Close panel" }).tap();
    }
    await page.getByRole("button", { name: "Pet Bella" }).tap();
    await expect(game(page)).toHaveAttribute("data-pet", "true");
    await walk(page, 260, 328, d.id, "touch");
    await page.getByRole("button", { name: "Interact", exact: false }).tap();
    await expect(game(page)).toHaveAttribute("data-scene", "street");
  }
  for (const s of spots("street").filter((s) => s.story)) {
    await walk(page, s.x, s.y, "street", "touch");
    await page.getByRole("button", { name: "Interact", exact: false }).tap();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("heading", { name: stories[s.story!].title }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close panel" }).tap();
  }
  const trace = await page.evaluate(
    () => (window as unknown as { playtestTrace: number[][] }).playtestTrace,
  );
  expect(trace.length).toBeGreaterThan(300);
  const ids: SceneId[] = ["street", "trieste", "books", "vesuvio", "tower"];
  for (const [id, x, y, bx, by] of trace) {
    expect(
      Math.hypot(x - bx, y - by),
      "Bella keeps up along the whole route",
    ).toBeLessThan(30);
    expect(blocked({ x, y }, ids[id], 6.9), "Michael stays navigable").toBe(
      false,
    );
    expect(
      blocked({ x: bx, y: by }, ids[id], 6.9),
      "Bella stays navigable",
    ).toBe(false);
  }
  await page.getByRole("button", { name: /Switch outfit/ }).tap();
  await expect(game(page)).toHaveAttribute("data-outfit", "sweater");
  for (const panel of ["About", "Projects", "Contact"]) {
    await page.getByRole("button", { name: panel, exact: true }).tap();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close panel" }).tap();
  }
  await page.reload();
  await expect(game(page)).toHaveAttribute("data-outfit", "sweater");
  await expect(game(page)).toHaveAttribute("data-scene", "street");
  expect(errors).toEqual([]);
  await context.close();
});
