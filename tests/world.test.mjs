import test from "node:test";
import assert from "node:assert/strict";
import {
  blocked,
  destinations,
  spots,
  start,
  dimensions,
} from "../src/game/world.ts";
import { move, velocity } from "../src/game/movement.ts";
import { Companion } from "../src/game/companion.ts";
import { readPreferences, savePreferences } from "../src/game/config.ts";
function path(from, to, scene) {
  const step = 4,
    key = (p) => `${p.x},${p.y}`,
    origin = {
      x: Math.round(from.x / step) * step,
      y: Math.round(from.y / step) * step,
    },
    q = [origin],
    seen = new Set([key(origin)]);
  for (let i = 0; i < q.length; i++) {
    const p = q[i];
    if (Math.hypot(p.x - to.x, p.y - to.y) < 16) return true;
    for (const [dx, dy] of [
      [step, 0],
      [-step, 0],
      [0, step],
      [0, -step],
    ]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (!blocked(n, scene) && !seen.has(key(n))) {
        seen.add(key(n));
        q.push(n);
      }
    }
  }
  return false;
}
test("all outdoor interactions are reachable from the spawn", () => {
  assert.equal(blocked(start, "street"), false);
  for (const s of spots("street")) assert.ok(path(start, s, "street"), s.id);
});
test("all interiors have reachable stories and safe exits / returns", () => {
  for (const d of destinations) {
    const p = { x: 260, y: 313 };
    assert.equal(blocked(p, d.id), false);
    for (const s of spots(d.id))
      assert.ok(path(p, s, d.id), `${d.id}: ${s.id}`);
    assert.equal(spots(d.id)[0].door, "street");
    assert.equal(blocked({ x: d.door.x, y: d.door.y + 14 }, "street"), false);
  }
});
test("movement cannot tunnel through buildings, and diagonals are normalized", () => {
  const p = move({ x: 350, y: 200 }, 300, 0, "street");
  assert.ok(p.x < 359);
  assert.equal(blocked(p, "street"), false);
  assert.ok(
    Math.abs(Math.hypot(...Object.values(velocity(1, 1, 1))) - 100) < 0.0001,
  );
});
test("Bella follows a safe recorded route through a tight turn and resets safely", () => {
  let p = { x: 340, y: 280 };
  const dog = new Companion(p);
  for (const [dx, dy] of [
    [0, 80],
    [270, 0],
    [0, -140],
  ]) {
    for (let i = 0; i < 100; i++) {
      const next = move(p, dx / 100, dy / 100, "street");
      dog.follow(p, next);
      p = next;
      assert.equal(blocked(dog.position, "street"), false);
    }
  }
  assert.ok(Math.hypot(p.x - dog.position.x, p.y - dog.position.y) < 30);
  dog.reset({ x: 260, y: 313 });
  assert.equal(dog.trail.length, 0);
  assert.deepEqual(dog.position, { x: 260, y: 313 });
});
test("corrupt, unavailable, and malformed storage gracefully use defaults", () => {
  for (const raw of [
    "broken",
    "null",
    "[]",
    '{"outfit":"invalid","sound":"yes"}',
  ])
    assert.deepEqual(readPreferences({ getItem: () => raw }), {
      outfit: "rice",
      sound: false,
    });
  assert.deepEqual(
    readPreferences({
      getItem() {
        throw Error("denied");
      },
    }),
    { outfit: "rice", sound: false },
  );
  assert.doesNotThrow(() =>
    savePreferences(
      {
        setItem() {
          throw Error("denied");
        },
      },
      { outfit: "rice", sound: false },
    ),
  );
  assert.deepEqual(
    readPreferences({ getItem: () => '{"outfit":"sweater","sound":true}' }),
    { outfit: "sweater", sound: true },
  );
});
