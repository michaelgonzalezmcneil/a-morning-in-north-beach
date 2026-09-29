import { blocked, type Point, type SceneId } from "./world.ts";
export function move(
  p: Point,
  dx: number,
  dy: number,
  scene: SceneId,
  onStep?: (point: Point) => void,
): Point {
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 3));
  const next = { ...p };
  for (let i = 0; i < n; i++) {
    if (dx && !blocked({ x: next.x + dx / n, y: next.y }, scene)) {
      next.x += dx / n;
      onStep?.({ ...next });
    }
    if (dy && !blocked({ x: next.x, y: next.y + dy / n }, scene)) {
      next.y += dy / n;
      onStep?.({ ...next });
    }
  }
  return next;
}
export function velocity(x: number, y: number, dt: number) {
  const length = Math.hypot(x, y);
  return length
    ? { x: (x / length) * 100 * dt, y: (y / length) * 100 * dt }
    : { x: 0, y: 0 };
}
