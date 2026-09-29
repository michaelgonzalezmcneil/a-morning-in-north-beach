import { test, expect } from "@playwright/test";
import { game, walk } from "./helpers";

test("Bella turns, idles, settles, and responds to repeat pets without interrupting reading", async ({
  page,
}) => {
  await page.goto("/");
  await expect(game(page)).toHaveAttribute("data-scene", "street");
  for (const [key, facing] of [
    ["ArrowRight", "1"],
    ["ArrowDown", "0"],
    ["ArrowLeft", "2"],
    ["ArrowUp", "3"],
  ]) {
    await game(page).focus();
    await page.keyboard.down(key);
    await page.waitForTimeout(650);
    await expect(game(page)).toHaveAttribute("data-bella-mode", "follow");
    await expect(game(page)).toHaveAttribute("data-bella-facing", facing);
    const stride = await game(page).getAttribute("data-bella-stride");
    await page.waitForTimeout(80);
    expect(await game(page).getAttribute("data-bella-stride")).not.toBe(stride);
    await page.screenshot({
      path: `docs/screenshots/bella-walk-${facing}.png`,
      fullPage: true,
    });
    await page.keyboard.up(key);
  }
  await expect(game(page)).toHaveAttribute("data-bella-mode", "watch");
  const resting = await game(page).getAttribute("data-bella");
  await expect(game(page)).toHaveAttribute("data-bella-mode", "sniff", {
    timeout: 10000,
  });
  expect(await game(page).getAttribute("data-bella")).toBe(resting);
  await page.screenshot({
    path: "docs/screenshots/bella-sniff.png",
    fullPage: true,
  });
  await expect(game(page)).toHaveAttribute("data-bella-mode", "watch");
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("p");
    await expect(game(page)).toHaveAttribute("data-pet", "true");
    await page.waitForTimeout(80);
  }
  await page.screenshot({
    path: "docs/screenshots/bella-pet.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "About", exact: true }).click();
  await expect(game(page)).toHaveAttribute("data-pet", "false");
  const before = await game(page).getAttribute("data-bella");
  const stride = await game(page).getAttribute("data-bella-stride");
  await page.keyboard.press("p");
  await page.waitForTimeout(800);
  expect(await game(page).getAttribute("data-bella")).toBe(before);
  expect(await game(page).getAttribute("data-bella-stride")).toBe(stride);
  await page.keyboard.press("Escape");
  await walk(page, 465, 293, "street");
  await page.keyboard.press("e");
  await expect(game(page)).toHaveAttribute("data-scene", "trieste");
  await walk(page, 328, 237, "trieste");
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(game(page)).toHaveAttribute("data-bella-mode", "settled");
  await page.keyboard.press("Escape");
  await expect(game(page)).toHaveAttribute("data-sitting", "true");
  await page.waitForTimeout(800);
  await expect(game(page)).toHaveAttribute("data-bella-mode", "settled");
  await page.screenshot({
    path: "docs/screenshots/bella-settled.png",
    fullPage: true,
  });
  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(450);
  await page.keyboard.up("ArrowDown");
  await expect(game(page)).toHaveAttribute("data-sitting", "false");
});

test("reduced motion uses quiet poses and muted/repeated pets do not stack sound", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createOscillator;
    (window as unknown as { toneCount: number }).toneCount = 0;
    AudioContext.prototype.createOscillator = function () {
      (window as unknown as { toneCount: number }).toneCount++;
      return original.call(this);
    };
  });
  await page.goto("/");
  await expect(game(page)).toHaveAttribute("data-reduced", "true");
  await page.waitForTimeout(1000);
  const before = await game(page).evaluate((c) =>
    (c as HTMLCanvasElement).toDataURL(),
  );
  await page.waitForTimeout(1200);
  expect(
    await game(page).evaluate((c) => (c as HTMLCanvasElement).toDataURL()),
  ).toBe(before);
  const count = () =>
    page.evaluate(() => (window as unknown as { toneCount: number }).toneCount);
  await page.keyboard.press("p");
  await expect(game(page)).toHaveAttribute("data-pet", "true");
  expect(await count()).toBe(0);
  await page.waitForTimeout(80);
  const petFrame = await game(page).evaluate((c) =>
    (c as HTMLCanvasElement).toDataURL(),
  );
  await page.waitForTimeout(150);
  expect(
    await game(page).evaluate((c) => (c as HTMLCanvasElement).toDataURL()),
  ).toBe(petFrame);
  await page.getByRole("button", { name: "Enable sound" }).click();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("p");
    await page.waitForTimeout(40);
  }
  expect(await count()).toBe(1);
  await page.getByRole("button", { name: "Mute sound" }).click();
  await page.waitForTimeout(700);
  await page.keyboard.press("p");
  expect(await count()).toBe(1);
  await page.waitForTimeout(1400);
  await expect(game(page)).toHaveAttribute("data-bella-mode", "watch");
});
