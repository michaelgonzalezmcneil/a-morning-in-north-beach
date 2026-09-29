import { blocked, type SceneId, type Point } from "./world.ts";

export type CompanionMode = "follow" | "watch" | "sniff" | "settled" | "pet";
export type CompanionPose = {
  mode: CompanionMode;
  facing: number; // down, right, left, up; matches Michael's directions
  stride: number; // distance-driven, so feet stop when movement stops
};
export const PET_DURATION = 1.2;
const FOLLOW_GAP = 22;
const REST_GAP = 15;

function facing(dx: number, dy: number, previous: number) {
  // Retain the last axis around diagonals instead of flickering between poses.
  const horizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
  const vertical = Math.abs(dy) > Math.abs(dx) * 1.2;
  if (horizontal || (!vertical && (previous === 1 || previous === 2)))
    return dx >= 0 ? 1 : 2;
  return dy >= 0 ? 0 : 3;
}

/** Follows the exact collision-checked substeps of Michael's movement.
 * All idle actions change pose only: no random destinations or second pathfinder.
 */
export class Companion {
  position: Point;
  trail: Point[] = [];
  distance = 0;
  pose: CompanionPose = { mode: "watch", facing: 1, stride: 0 };
  private scene: SceneId = "street";
  private idleTime = 0;
  private sniffAt = 6.5;
  private sniffCount = 0;

  constructor(p: Point) {
    this.position = { ...p };
  }
  reset(p: Point) {
    this.position = { ...p };
    this.trail = [];
    this.distance = 0;
    this.idleTime = 0;
    this.sniffAt = 6.5;
    this.sniffCount = 0;
    this.pose = { mode: "watch", facing: 1, stride: 0 };
  }
  resetBeside(p: Point, scene: SceneId) {
    this.scene = scene;
    this.reset(p);
    for (const offset of [
      { x: -FOLLOW_GAP, y: 0 },
      { x: FOLLOW_GAP, y: 0 },
      { x: 0, y: FOLLOW_GAP },
      { x: 0, y: -FOLLOW_GAP },
    ]) {
      const trail = Array.from({ length: 23 }, (_, i) => ({
        x: p.x + offset.x * (1 - i / 22),
        y: p.y + offset.y * (1 - i / 22),
      }));
      if (trail.every((point) => !blocked(point, scene))) {
        this.position = trail[0];
        this.trail = trail.slice(1);
        this.distance = FOLLOW_GAP;
        this.lookAt(p);
        return;
      }
    }
  }
  record(next: Point) {
    const previous = this.trail.at(-1) ?? this.position;
    const step = Math.hypot(next.x - previous.x, next.y - previous.y);
    if (step < 0.00001) return;
    this.trail.push({ ...next });
    this.distance += step;
  }
  private lookAt(player: Point) {
    const dx = player.x - this.position.x,
      dy = player.y - this.position.y;
    if (Math.hypot(dx, dy) > 2)
      this.pose.facing = facing(dx, dy, this.pose.facing);
  }
  hold(player: Point, sitting: boolean) {
    this.pose.mode = sitting ? "settled" : "watch";
    this.lookAt(player);
    this.idleTime = 0;
    this.sniffAt = 6.5;
  }
  update(
    dt: number,
    player: Point,
    moving: boolean,
    sitting: boolean,
    pet: boolean,
    reduced: boolean,
  ) {
    const gap = moving ? FOLLOW_GAP : REST_GAP;
    // Constant path speed while following; soften the last few pixels at rest.
    const remaining = Math.max(0, this.distance - gap);
    let budget = Math.min(
      remaining,
      Math.max(0, dt) * (moving ? 160 : Math.max(12, remaining * 9)),
    );
    let travelled = 0,
      dx = 0,
      dy = 0;
    while (budget > 0.00001 && this.trail.length) {
      const target = this.trail[0];
      const length = Math.hypot(
        target.x - this.position.x,
        target.y - this.position.y,
      );
      if (length < 0.00001) {
        this.trail.shift();
        continue;
      }
      const amount = Math.min(length, budget, 1);
      const next = {
        x: this.position.x + ((target.x - this.position.x) * amount) / length,
        y: this.position.y + ((target.y - this.position.y) * amount) / length,
      };
      // Defensive recovery if future world edits invalidate a recorded step.
      if (blocked(next, this.scene)) {
        this.resetBeside(player, this.scene);
        return;
      }
      dx += next.x - this.position.x;
      dy += next.y - this.position.y;
      this.position = next;
      this.distance = Math.max(0, this.distance - amount);
      travelled += amount;
      budget -= amount;
      if (amount >= length - 0.00001) this.trail.shift();
    }
    if (travelled > 0.01) {
      this.pose.mode = "follow";
      this.pose.stride += travelled / 3.5;
      this.pose.facing = facing(dx, dy, this.pose.facing);
      this.idleTime = 0;
      this.sniffAt = 6.5;
      return;
    }
    this.idleTime += Math.max(0, dt);
    this.lookAt(player);
    if (sitting) this.pose.mode = "settled";
    else if (pet) {
      this.pose.mode = "pet";
      this.idleTime = 0;
      this.sniffAt = 6.5;
    } else if (!moving && !reduced && this.idleTime >= this.sniffAt) {
      this.pose.mode = "sniff";
      if (this.idleTime >= this.sniffAt + 1.1) {
        this.sniffCount++;
        this.sniffAt = this.idleTime + 8 + (this.sniffCount % 3) * 2;
        this.pose.mode = "watch";
      }
    } else this.pose.mode = "watch";
  }
}
