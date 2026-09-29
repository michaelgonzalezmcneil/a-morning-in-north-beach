import test from "node:test";
import assert from "node:assert/strict";
import { Companion } from "../src/game/companion.ts";
import { move, velocity } from "../src/game/movement.ts";
import { blocked, destinations, start } from "../src/game/world.ts";

function tick(dog, player, dx, dy, scene, dt = 1 / 60) {
  const v = velocity(dx, dy, dt);
  const next = move(player, v.x, v.y, scene, (p) => dog.record(p));
  dog.update(
    dt,
    next,
    Math.hypot(next.x - player.x, next.y - player.y) > 0.01,
    false,
    false,
    false,
  );
  return next;
}

test("Bella traverses certified substeps through corners, diagonal wall slides and rapid reversals", () => {
  for (const scene of ["street", "trieste", "books", "vesuvio", "tower"]) {
    let player = scene === "street" ? { x: 350, y: 290 } : { x: 215, y: 290 };
    const dog = new Companion(player);
    dog.resetBeside(player, scene);
    // Mix long wall slides with reversals shorter than the follow gap.
    const routes = [
      [1, -1, 100],
      [-1, 0, 8],
      [1, 0, 8],
      [0, -1, 110],
      [-1, 1, 100],
      [1, 0, 90],
      [0, 1, 150],
      [-1, -1, 90],
    ];
    for (const [dx, dy, frames] of routes)
      for (let i = 0; i < frames; i++) {
        const steps = [];
        const v = velocity(dx, dy, 1 / 60);
        player = move(player, v.x, v.y, scene, (p) => {
          steps.push(p);
          dog.record(p);
        });
        for (const p of steps) assert.equal(blocked(p, scene), false);
        // Fine updates expose every traversed companion segment, not just endpoints.
        for (let j = 0; j < 6; j++) {
          const before = { ...dog.position };
          dog.update(1 / 360, player, true, false, false, false);
          assert.equal(blocked(dog.position, scene), false, scene);
          assert.ok(
            Math.hypot(dog.position.x - before.x, dog.position.y - before.y) <=
              160 / 360 + 1e-6,
          );
          assert.ok(
            Math.hypot(player.x - dog.position.x, player.y - dog.position.y) <
              30,
          );
        }
        assert.ok(
          dog.trail.length < 150,
          "trail stays bounded, including diagonal motion",
        );
      }
  }
});

test("stopping closes the gap gently; watch, sniff and settle never wander", () => {
  let player = { ...start };
  const dog = new Companion(player);
  dog.resetBeside(player, "street");
  for (let i = 0; i < 45; i++) player = tick(dog, player, 1, 0, "street");
  const gap = dog.distance;
  dog.update(1 / 60, player, false, false, false, false);
  assert.ok(
    dog.distance < gap && dog.distance > 15,
    "no snap to resting distance",
  );
  for (let i = 0; i < 90; i++)
    dog.update(1 / 60, player, false, false, false, false);
  assert.ok(Math.abs(dog.distance - 15) < 0.01);
  const rest = { ...dog.position };
  let sniffFrames = 0;
  let watching = false;
  for (let i = 0; i < 60 * 24; i++) {
    dog.update(1 / 60, player, false, false, false, false);
    assert.deepEqual(dog.position, rest);
    if (dog.pose.mode === "sniff") sniffFrames++;
    if (dog.pose.mode === "watch") watching = true;
  }
  assert.ok(sniffFrames > 30 && sniffFrames < 180, "brief, spaced sniffing");
  assert.equal(watching, true);
  assert.equal(dog.pose.facing, 1, "looks toward Michael on the right");
  dog.hold(player, true);
  assert.equal(dog.pose.mode, "settled");
  for (let i = 0; i < 100; i++)
    dog.update(1 / 60, player, false, true, false, false);
  assert.equal(dog.pose.mode, "settled");
  assert.deepEqual(dog.position, rest);
  for (let i = 0; i < 30; i++) player = tick(dog, player, -1, 0, "street");
  assert.equal(dog.pose.mode, "follow");
  assert.equal(dog.pose.facing, 2);
});

test("repeated pets and reduced motion preserve position; scene resets discard old trails", () => {
  const dog = new Companion(start);
  dog.resetBeside(start, "street");
  for (let i = 0; i < 100; i++)
    dog.update(1 / 60, start, false, false, false, true);
  const rest = { ...dog.position };
  for (let i = 0; i < 1200; i++) {
    dog.update(1 / 60, start, false, false, i % 120 < 30, true);
    assert.notEqual(dog.pose.mode, "sniff");
    assert.deepEqual(dog.position, rest);
  }
  for (const d of destinations)
    for (const [scene, p] of [
      [d.id, { x: 260, y: 313 }],
      ["street", { x: d.door.x, y: d.door.y + 14 }],
    ]) {
      dog.resetBeside(p, scene);
      assert.equal(blocked(dog.position, scene), false);
      assert.equal(dog.pose.mode, "watch");
      assert.equal(dog.pose.stride, 0);
      assert.ok(dog.trail.every((q) => !blocked(q, scene)));
      assert.ok(Math.hypot(p.x - dog.position.x, p.y - dog.position.y) <= 22);
      for (let i = 0; i < 30; i++)
        dog.update(1 / 60, p, false, false, true, false);
      assert.equal(dog.pose.mode, "pet");
      assert.equal(blocked(dog.position, scene), false);
    }
});
