export type Point = { x: number; y: number };
export type Rect = Point & { w: number; h: number };
export type SceneId = "street" | "trieste" | "books" | "vesuvio" | "tower";
export type Spot = Point & {
  id: string;
  label: string;
  story?: string;
  door?: SceneId;
  sit?: boolean;
};
export const destinations = [
  {
    id: "trieste",
    name: "Caffè Trieste",
    subtitle: "A warm cup & a window seat",
    x: 365,
    y: 133,
    w: 190,
    h: 144,
    color: "#b67f62",
    door: { x: 465, y: 293 },
    number: "01",
  },
  {
    id: "books",
    name: "City Lights",
    subtitle: "A little room for browsing",
    x: 80,
    y: 327,
    w: 220,
    h: 144,
    color: "#c8c0a2",
    door: { x: 233, y: 487 },
    number: "02",
  },
  {
    id: "vesuvio",
    name: "Vesuvio Café",
    subtitle: "An alley full of stories",
    x: 365,
    y: 429,
    w: 191,
    h: 137,
    color: "#889788",
    door: { x: 462, y: 582 },
    number: "03",
  },
  {
    id: "tower",
    name: "Coit Tower",
    subtitle: "Up the hill, toward the bay",
    x: 725,
    y: 66,
    w: 62,
    h: 148,
    color: "#d7cead",
    door: { x: 756, y: 230 },
    number: "04",
  },
] as const;
export const start: Point = { x: 440, y: 343 };
export const sceneNames: Record<SceneId, string> = {
  street: "North Beach",
  trieste: "Caffè Trieste",
  books: "City Lights Bookstore",
  vesuvio: "Vesuvio Café",
  tower: "Coit Tower · observation room",
};
export const trees = [
  { x: 57, y: 122 },
  { x: 120, y: 177 },
  { x: 254, y: 142 },
  { x: 606, y: 160 },
  { x: 666, y: 94 },
  { x: 834, y: 152 },
  { x: 819, y: 277 },
  { x: 651, y: 330 },
  { x: 710, y: 428 },
  { x: 633, y: 530 },
  { x: 75, y: 556 },
];
export function dimensions(scene: SceneId) {
  return scene === "street" ? { w: 900, h: 650 } : { w: 520, h: 390 };
}
export function obstacles(scene: SceneId): Rect[] {
  if (scene === "street")
    return [
      ...destinations.map((d) => ({ x: d.x, y: d.y, w: d.w, h: d.h })),
      ...trees.map((t) => ({ x: t.x - 6, y: t.y - 7, w: 12, h: 14 })),
      { x: 105, y: 82, w: 150, h: 61 },
      { x: 35, y: 225, w: 197, h: 57 },
      { x: 603, y: 388, w: 40, h: 12 },
    ];
  if (scene === "trieste")
    return [
      { x: 72, y: 80, w: 376, h: 40 },
      { x: 96, y: 178, w: 65, h: 48 },
      { x: 342, y: 186, w: 65, h: 48 },
    ];
  if (scene === "books")
    return [
      { x: 60, y: 70, w: 400, h: 37 },
      { x: 76, y: 157, w: 116, h: 27 },
      { x: 324, y: 157, w: 116, h: 27 },
      { x: 76, y: 238, w: 116, h: 27 },
    ];
  if (scene === "vesuvio")
    return [
      { x: 70, y: 75, w: 245, h: 45 },
      { x: 370, y: 184, w: 55, h: 48 },
      { x: 104, y: 206, w: 55, h: 48 },
    ];
  return [
    { x: 80, y: 83, w: 360, h: 32 },
    { x: 90, y: 230, w: 90, h: 22 },
    { x: 345, y: 230, w: 85, h: 22 },
  ];
}
export function spots(scene: SceneId): Spot[] {
  if (scene === "street")
    return [
      ...destinations.map((d) => ({
        id: d.id,
        label: `Enter ${d.name}`,
        x: d.door.x,
        y: d.door.y,
        door: d.id,
      })),
      {
        id: "alley",
        label: "Pause in Jack Kerouac Alley",
        x: 325,
        y: 438,
        story: "alley",
      },
      { id: "view", label: "Take in the view", x: 814, y: 226, story: "view" },
      { id: "bench", label: "Rest a little", x: 621, y: 415, story: "bench" },
      {
        id: "flowers",
        label: "Notice the flowers",
        x: 579,
        y: 283,
        story: "flowers",
      },
    ];
  const exit: Spot = {
    id: "exit",
    label: "Back to North Beach",
    x: 260,
    y: 346,
    door: "street",
  };
  const extra: Record<Exclude<SceneId, "street">, Spot[]> = {
    trieste: [
      {
        id: "counter",
        label: "Approach the counter",
        x: 153,
        y: 137,
        story: "counter",
      },
      {
        id: "matcha",
        label: "Inspect the matcha latte",
        x: 359,
        y: 137,
        story: "matcha",
      },
      {
        id: "seat",
        label: "Sit by the window",
        x: 328,
        y: 237,
        story: "seat",
        sit: true,
      },
    ],
    books: [
      {
        id: "books",
        label: "Browse the fiction shelf",
        x: 130,
        y: 200,
        story: "books",
      },
      { id: "poetry", label: "Browse poetry", x: 381, y: 199, story: "poetry" },
      {
        id: "travel",
        label: "Browse travel books",
        x: 132,
        y: 284,
        story: "travel",
      },
    ],
    vesuvio: [
      {
        id: "vesuvio",
        label: "Look around Vesuvio",
        x: 245,
        y: 139,
        story: "vesuvio",
      },
      {
        id: "alley",
        label: "Remember the alley",
        x: 353,
        y: 237,
        story: "alley",
      },
    ],
    tower: [
      {
        id: "tower",
        label: "Explore the observation room",
        x: 258,
        y: 134,
        story: "tower",
      },
      {
        id: "view",
        label: "Look across the bay",
        x: 397,
        y: 136,
        story: "view",
      },
    ],
  };
  return [exit, ...extra[scene]];
}
export function blocked(p: Point, scene: SceneId, radius = 7) {
  const d = dimensions(scene);
  const margin = scene === "street" ? 16 : 42;
  return (
    p.x < margin + radius ||
    p.y < margin + radius ||
    p.x > d.w - margin - radius ||
    p.y > d.h - margin - radius ||
    obstacles(scene).some(
      (r) =>
        p.x > r.x - radius &&
        p.x < r.x + r.w + radius &&
        p.y > r.y - radius &&
        p.y < r.y + r.h + radius,
    )
  );
}
export function nearest(p: Point, scene: SceneId) {
  return spots(scene)
    .filter((s) => Math.hypot(s.x - p.x, s.y - p.y) < 32)
    .sort(
      (a, b) =>
        Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y),
    )[0];
}
