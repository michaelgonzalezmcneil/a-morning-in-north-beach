import { blocked, type SceneId, type Point } from "./world.ts";
/** A breadcrumb trail of actual collision-checked positions. Bella follows every turn.
 * The same player radius safely covers her smaller body. No straight-line shortcuts. */
export class Companion {
  position: Point;
  trail: Point[] = [];
  distance = 0;
  constructor(p: Point) {
    this.position = { ...p };
  }
  reset(p: Point) {
    this.position = { ...p };
    this.trail = [];
    this.distance = 0;
  }
  resetBeside(p: Point, scene: SceneId) {
    this.reset(p);
    for (const offset of [
      { x: -22, y: 0 },
      { x: 22, y: 0 },
      { x: 0, y: 22 },
      { x: 0, y: -22 },
    ]) {
      const trail = Array.from({ length: 12 }, (_, i) => ({
        x: p.x + offset.x * (1 - i / 11),
        y: p.y + offset.y * (1 - i / 11),
      }));
      if (trail.every((point) => !blocked(point, scene))) {
        this.position = trail[0];
        this.trail = trail.slice(1);
        this.distance = 22;
        return;
      }
    }
  }
  follow(previous: Point, next: Point) {
    const step = Math.hypot(next.x - previous.x, next.y - previous.y);
    if (!step) return;
    this.trail.push({ ...next });
    this.distance += step;
    while (this.distance > 23 && this.trail.length) {
      const target = this.trail.shift()!;
      this.distance -= Math.hypot(
        target.x - this.position.x,
        target.y - this.position.y,
      );
      this.position = target;
    }
  }
}
