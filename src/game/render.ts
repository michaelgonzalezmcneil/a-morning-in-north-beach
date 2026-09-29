import { appearance } from "./config";
import {
  destinations,
  dimensions,
  spots,
  trees,
  type Point,
  type SceneId,
} from "./world";
export type RenderState = {
  scene: SceneId;
  player: Point;
  bella: Point;
  direction: number;
  walking: boolean;
  time: number;
  pet: number;
  outfit: "rice" | "sweater";
  reduced: boolean;
  sitting: boolean;
};
const C = {
  ink: "#334b49",
  grass: "#8faaa0",
  grassLight: "#a6bbb0",
  pavement: "#b9c4bb",
  road: "#7d9497",
  edge: "#637e80",
  cream: "#ece1bc",
  warm: "#efd195",
};
function rect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), w, h);
}
function label(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 9,
  color = C.ink,
) {
  c.fillStyle = color;
  c.font = `${size}px monospace`;
  c.textAlign = "center";
  c.fillText(text, Math.round(x), Math.round(y));
}
function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}
function plant(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  flowers = false,
) {
  rect(c, x - 6, y, 12, 8, "#aa7960");
  rect(c, x - 8, y - 2, 16, 3, "#cc9d73");
  rect(c, x - 1, y - 16, 2, 15, "#567766");
  rect(c, x - 8, y - 12, 7, 6, "#557f6b");
  rect(c, x + 1, y - 17, 7, 8, "#709578");
  if (flowers) {
    rect(c, x - 8, y - 15, 4, 4, "#ead19a");
    rect(c, x + 4, y - 20, 4, 4, "#c88980");
  }
}
function tree(c: CanvasRenderingContext2D, x: number, y: number) {
  ellipse(c, x + 8, y + 4, 25, 8, "#7c958976");
  rect(c, x - 4, y - 28, 8, 34, "#716b53");
  rect(c, x - 15, y - 40, 30, 21, "#52776a");
  rect(c, x - 24, y - 32, 47, 18, "#618775");
  rect(c, x - 18, y - 48, 33, 18, "#739682");
  rect(c, x - 10, y - 53, 18, 10, "#86a38b");
  rect(c, x - 20, y - 28, 12, 6, "#749781");
  rect(c, x + 10, y - 19, 10, 6, "#4b7063");
}
function windowArt(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w = 27,
  h = 32,
) {
  rect(c, x - 3, y - 3, w + 6, h + 6, "#526564");
  rect(c, x, y, w, h, C.warm);
  rect(c, x + 2, y + 2, w - 4, 7, "#f4dfad");
  rect(c, x + w / 2 - 1, y, 2, h, "#7c806b");
  rect(c, x, y + h / 2, w, 2, "#7c806b");
  rect(c, x - 4, y + h + 3, w + 8, 3, "#ded6b8");
}
function building(
  c: CanvasRenderingContext2D,
  d: (typeof destinations)[number],
) {
  const { x, y, w, h } = d;
  if (d.id === "tower") {
    ellipse(c, x + 32, y + h + 8, 53, 13, "#7a958979");
    rect(c, x - 13, y + h - 13, w + 26, 13, "#b8b599");
    rect(c, x + 3, y + 20, w - 6, h - 20, "#d8d2b6");
    rect(c, x, y + 10, w, 23, "#e5dfc5");
    rect(c, x + 6, y, w - 12, 12, "#cec9af");
    for (let i = 0; i < 4; i++) {
      rect(c, x + 10 + i * 12, y + 16, 6, 16, "#768780");
      rect(c, x + 10 + i * 12, y + 38, 3, 94, "#b6b69e");
    }
    rect(c, x + 23, y + h - 22, 16, 22, "#526962");
    label(c, "COIT TOWER", x + w / 2, y + h + 32, 9);
    return;
  }
  rect(c, x + 8, y + 8, w, h, "#647c7666");
  rect(c, x, y, w, h, d.color);
  rect(c, x - 5, y - 5, w + 10, 9, "#576865");
  rect(c, x + 4, y + 5, w - 8, 26, "#75817a");
  rect(c, x + 9, y + 9, w - 18, 3, "#91988b");
  rect(c, x + w - 46, y + 10, 25, 14, "#687971");
  rect(c, x + w - 43, y + 12, 19, 2, "#9aa597");
  rect(c, x + 24, y + 12, 28, 12, "#62736e");
  rect(c, x + 26, y + 14, 24, 2, "#93a193");
  for (let by = y + 34; by < y + 79; by += 9)
    for (let bx = x + 4; bx < x + w - 4; bx += 17)
      rect(c, bx + (by % 2) * 5, by, 9, 1, "#f5dfb61c");
  for (let i = 0; i < 4; i++)
    windowArt(c, x + 16 + (i * (w - 30)) / 4, y + 42, 24, 25);
  rect(
    c,
    x - 5,
    y + 80,
    w + 10,
    22,
    d.id === "trieste" ? "#577c66" : d.id === "books" ? "#e4d9b7" : "#a96652",
  );
  label(
    c,
    d.id === "books"
      ? "CITY LIGHTS BOOKSELLERS"
      : d.id === "trieste"
        ? "CAFFÈ TRIESTE"
        : "VESUVIO",
    x + w / 2,
    y + 94,
    d.id === "books" ? 9 : 12,
    d.id === "books" ? C.ink : "#fff0d0",
  );
  const dy = y + 105;
  for (let i = 0; i < 2; i++) windowArt(c, x + 15 + i * 48, dy, 34, 28);
  const doorX = d.door.x - 12;
  rect(c, doorX, dy, 24, h - 105, "#3c5652");
  rect(c, doorX + 4, dy + 4, 16, 20, "#dabf88");
  rect(c, doorX + 17, dy + 23, 2, 2, "#ffe8ac");
  rect(c, doorX - 3, y + h - 2, 30, 4, "#d2c8aa");
  if (d.id === "trieste") {
    for (let i = 0; i < w / 12; i++) {
      rect(c, x + i * 12, y + 99, 12, 7, i % 2 ? "#d2c8a6" : "#708d78");
    }
  }
  if (d.id === "books") {
    rect(c, x + 168, dy, 37, 27, "#465d53");
    for (let i = 0; i < 9; i++)
      rect(
        c,
        x + 170 + i * 4,
        dy + 9 + (i % 3),
        3,
        14,
        ["#c88b71", "#c5be8b", "#86a89c"][i % 3],
      );
  }
  plant(c, x - 12, y + h - 1, true);
  plant(c, x + w + 10, y + h - 1);
}
function street(c: CanvasRenderingContext2D, t: number, reduced: boolean) {
  rect(c, 0, 0, 900, 650, C.grass);
  for (let y = 0; y < 650; y += 14)
    for (let x = 0; x < 900; x += 17) {
      if ((x * 7 + y * 13) % 11 < 4) rect(c, x + (y % 5), y, 3, 1, "#a7bcb03e");
    }
  // Columbus runs diagonally; Vallejo crosses east-west. All distances are compressed.
  c.fillStyle = C.pavement;
  c.beginPath();
  c.moveTo(115, 0);
  c.lineTo(239, 0);
  c.lineTo(501, 650);
  c.lineTo(351, 650);
  c.closePath();
  c.fill();
  c.fillStyle = C.road;
  c.beginPath();
  c.moveTo(139, 0);
  c.lineTo(214, 0);
  c.lineTo(470, 650);
  c.lineTo(382, 650);
  c.closePath();
  c.fill();
  rect(c, 0, 285, 665, 67, C.pavement);
  rect(c, 0, 301, 665, 34, C.road);
  rect(c, 305, 327, 53, 288, C.pavement);
  rect(c, 563, 173, 37, 383, C.pavement);
  // Hill switchback and steps.
  rect(c, 599, 252, 161, 30, "#c6c5ab");
  rect(c, 730, 207, 50, 74, "#c6c5ab");
  for (let i = 0; i < 9; i++) rect(c, 642 + i * 10, 252, 2, 30, "#a2ae98");
  rect(c, 704, 211, 136, 28, "#bfc3a8");
  for (let i = 0; i < 7; i++) rect(c, 267 + i * 10, 303, 5, 30, "#d1d7c7");
  for (let i = 0; i < 5; i++) rect(c, 563, 296 + i * 8, 36, 4, "#d1d7c7");
  for (let i = 0; i < 14; i++)
    rect(c, 178 + i * 17, 28 + i * 44, 2, 17, "#ccd1b481");
  for (let x = 20; x < 650; x += 40) rect(c, x, 317, 17, 1, "#cbd0b7");
  rect(c, 301, 420, 65, 35, "#c9c0a5");
  for (let i = 0; i < 8; i++) rect(c, 304 + i * 8, 421, 1, 32, "#b2ad96");
  // Quiet residential context, with bay windows and terracotta roof lines.
  for (const r of [
    { x: 105, y: 82, w: 150, h: 61 },
    { x: 35, y: 225, w: 197, h: 57 },
  ]) {
    rect(c, r.x, r.y, r.w, r.h, "#91a397");
    rect(c, r.x - 3, r.y - 5, r.w + 6, 7, "#627c73");
    for (let x = r.x + 10; x < r.x + r.w - 15; x += 32)
      windowArt(c, x, r.y + 13, 20, 26);
  }
  destinations.forEach((d) => building(c, d));
  trees.forEach((p) => tree(c, p.x, p.y));
  // Lamps, bench, signs, flowers, pigeons.
  for (const p of [
    { x: 321, y: 285 },
    { x: 536, y: 350 },
    { x: 319, y: 558 },
    { x: 703, y: 245 },
  ]) {
    ellipse(c, p.x + 5, p.y + 1, 9, 3, "#6d898577");
    rect(c, p.x - 1, p.y - 35, 3, 37, "#526d68");
    rect(c, p.x - 5, p.y - 40, 11, 8, "#eddb9e");
    rect(c, p.x - 6, p.y - 42, 13, 3, "#536b62");
    rect(c, p.x - 3, p.y + 1, 7, 3, "#536b62");
  }
  rect(c, 603, 382, 40, 7, "#8e7860");
  rect(c, 603, 392, 40, 5, "#aa9070");
  rect(c, 607, 397, 3, 6, "#52675d");
  rect(c, 637, 397, 3, 6, "#52675d");
  plant(c, 580, 278, true);
  label(c, "VALLEJO ST", 476, 325, 8, "#dce2d1");
  c.save();
  c.translate(309, 371);
  c.rotate(1.18);
  label(c, "COLUMBUS AVENUE", 0, 0, 8, "#e0e3cd");
  c.restore();
  label(c, "JACK KEROUAC", 332, 405, 7);
  label(c, "ALLEY", 332, 414, 7);
  label(c, "TELEGRAPH HILL ↗", 674, 304, 8);
  for (let i = 0; i < 4; i++) {
    const x = 480 + i * 15,
      y = 370 + (i % 2) * 9;
    const bob = !reduced && Math.sin(t * 1.4 + i) > 0.7 ? 1 : 0;
    rect(c, x, y + bob, 7, 4, "#657879");
    rect(c, x + 5, y - 3 + bob, 4, 4, "#546969");
    rect(c, x + 8, y - 1 + bob, 2, 1, "#d2ba86");
    rect(c, x + 1, y + 4, 1, 2, "#9b7b61");
  }
  label(c, "N", 859, 45, 10);
  rect(c, 858, 52, 2, 22, C.ink);
  rect(c, 856, 54, 6, 2, C.ink);
}
function shelf(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  rect(c, x, y, w, h, "#6f6250");
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < (w - 8) / 7; i++)
      rect(
        c,
        x + 5 + i * 7,
        y + 4 + row * 15,
        5,
        11 - (i % 3),
        ["#9e6654", "#ccb579", "#76998b", "#dbccb0", "#788b9e"][i % 5],
      );
    rect(c, x + 2, y + 15 + row * 15, w - 4, 3, "#b89a73");
  }
}
function table(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  rect(c, x + 4, y + h, w - 8, 5, "#554e4077");
  rect(c, x, y, w, h, "#8f6a4e");
  rect(c, x + 3, y + 3, w - 6, h - 7, "#bb9870");
  rect(c, x + 12, y + 8, 12, 10, "#e4dac0");
  rect(c, x + 14, y + 9, 7, 6, "#7b9a68");
  plant(c, x + w - 13, y + 17);
}
function interior(c: CanvasRenderingContext2D, s: SceneId) {
  rect(c, 0, 0, 520, 390, "#718c83");
  rect(c, 30, 33, 460, 324, "#4a635b");
  rect(
    c,
    40,
    43,
    440,
    304,
    s === "books" ? "#c6aa7e" : s === "vesuvio" ? "#b6a17e" : "#cdbb95",
  );
  for (let y = 45; y < 345; y += 16) {
    rect(c, 41, y, 438, 1, "#a08a6944");
    for (let x = 45 + (y % 32 ? 0 : 24); x < 475; x += 48)
      rect(c, x, y, 1, 16, "#a08a6944");
  }
  rect(c, 38, 39, 444, 32, "#87988a");
  rect(c, 38, 65, 444, 5, "#617467");
  windowArt(c, 50, 124, 18, 80);
  windowArt(c, 452, 124, 18, 80);
  plant(c, 64, 319, true);
  plant(c, 456, 319);
  rect(c, 238, 336, 44, 13, "#746f5c");
  rect(c, 235, 335, 50, 3, "#e4d6af");
  label(c, "EXIT ↓", 260, 327, 9);
  label(
    c,
    s === "trieste"
      ? "CAFFÈ TRIESTE"
      : s === "books"
        ? "CITY LIGHTS"
        : s === "vesuvio"
          ? "VESUVIO"
          : "THE BAY, THROUGH THE FOG",
    260,
    59,
    12,
    "#fff0cf",
  );
  if (s === "trieste") {
    rect(c, 72, 80, 376, 40, "#926a50");
    rect(c, 72, 80, 376, 7, "#dbc19a");
    rect(c, 93, 65, 79, 25, "#607776");
    rect(c, 99, 69, 63, 12, "#adc0b1");
    for (let i = 0; i < 3; i++) {
      rect(c, 104 + i * 19, 84, 9, 5, "#d9d4b8");
      rect(c, 107 + i * 19, 78, 3, 8, "#354f4e");
    }
    for (let i = 0; i < 5; i++) {
      rect(c, 204 + i * 17, 74, 10, 7, "#e8ddbb");
    }
    rect(c, 353, 74, 15, 12, "#f2e6c2");
    rect(c, 355, 73, 11, 4, "#9bb181");
    table(c, 96, 178, 65, 48);
    table(c, 342, 186, 65, 48);
    rect(c, 316, 240, 24, 12, "#7a614d");
    rect(c, 315, 231, 4, 18, "#937655");
    rect(c, 315, 231, 25, 4, "#937655");
    label(c, "MATCHA", 362, 108, 7, "#f5e4b7");
    rect(c, 262, 177, 48, 31, "#52665b");
    rect(c, 265, 180, 42, 25, "#6b7c69");
    label(c, "SLOW", 286, 190, 6, "#e4d4aa");
    label(c, "MORNINGS", 286, 200, 6, "#e4d4aa");
    rect(c, 182, 267, 125, 29, "#ac8668");
    for (let i = 0; i < 8; i++) rect(c, 188 + i * 15, 270, 2, 23, "#c2a17c");
    for (let i = 0; i < 3; i++) {
      rect(c, 202 + i * 42, 126, 15, 6, "#947354");
      rect(c, 204 + i * 42, 132, 3, 6, "#705c45");
      rect(c, 212 + i * 42, 132, 3, 6, "#705c45");
    }
  }
  if (s === "books") {
    shelf(c, 60, 70, 400, 37);
    shelf(c, 76, 157, 116, 27);
    shelf(c, 324, 157, 116, 27);
    shelf(c, 76, 238, 116, 27);
    label(c, "FICTION", 134, 153, 8);
    label(c, "POETRY", 382, 153, 8);
    label(c, "TRAVEL", 134, 234, 8);
    rect(c, 309, 257, 108, 40, "#8c9b80");
    rect(c, 317, 264, 92, 26, "#aabc94");
    label(c, "READ A LITTLE.", 362, 280, 8);
  }
  if (s === "vesuvio") {
    rect(c, 70, 75, 245, 45, "#785b45");
    rect(c, 68, 75, 249, 7, "#cb9e6d");
    for (let i = 0; i < 8; i++) {
      rect(c, 82 + i * 27, 61, 8, 15, ["#638478", "#ac8764", "#b59c6e"][i % 3]);
      rect(c, 84 + i * 27, 58, 4, 5, "#cfc19b");
    }
    table(c, 370, 184, 55, 48);
    table(c, 104, 206, 55, 48);
    for (let i = 0; i < 3; i++) {
      rect(c, 341 + i * 41, 81, 33, 37, "#72573f");
      rect(c, 345 + i * 41, 85, 25, 29, ["#b79970", "#74958b", "#b07960"][i]);
      rect(c, 352 + i * 41, 94, 12, 13, "#d9c39a");
    }
    for (let i = 0; i < 5; i++)
      rect(c, 208 + i * 20, 251, 12, 12, i % 2 ? "#879c8c" : "#e1c99c");
  }
  if (s === "tower") {
    rect(c, 80, 83, 360, 32, "#9ab3ae");
    rect(c, 80, 103, 360, 12, "#739494");
    for (let i = 0; i < 15; i++)
      rect(c, 85 + i * 23, 100 - (i % 4) * 4, 14, 10 + (i % 4) * 4, "#7b9b97");
    for (let x = 80; x < 440; x += 72) rect(c, x, 80, 4, 35, "#e0d5b4");
    rect(c, 80, 112, 360, 4, "#ede2c2");
    table(c, 90, 230, 90, 22);
    table(c, 345, 230, 85, 22);
    rect(c, 229, 215, 60, 47, "#bab192");
    label(c, "SF", 260, 243, 19, "#7b897b");
  }
}
export function michael(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: Pick<
    RenderState,
    "outfit" | "walking" | "direction" | "time" | "pet" | "sitting" | "reduced"
  >,
  scale = 1,
) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale(scale, scale);
  const a = appearance.michael;
  const step = state.walking ? (Math.sin(state.time * 13) > 0 ? 2 : -2) : 0;
  const lean =
    state.pet > 0
      ? 2
      : !state.walking && !state.reduced && Math.sin(state.time * 1.4) > 0.8
        ? 1
        : 0;
  ellipse(c, 0, 1, 9, 3, "#3d56564d");
  rect(c, -5, -8, 4, 8 + (state.sitting ? -3 : step), a.jeans);
  rect(c, 2, -8, 4, 8 - (state.sitting ? 3 : step), a.jeans);
  rect(c, -6, step, 5, 3, "#394c4b");
  rect(c, 2, -step, 5, 3, "#394c4b");
  rect(c, -7, -21, 14, 14, state.outfit === "rice" ? a.rice : a.sweater);
  rect(c, -10, -20 + lean, 3, 12, a.skin);
  rect(c, 7, -20 + lean, 3, state.pet > 0 ? 6 : 12, a.skin);
  rect(c, -6, -32 + lean, 12, 12, a.skin);
  rect(c, -7, -34 + lean, 14, 5, a.hair);
  rect(c, -7, -31 + lean, 3, 7, a.hair);
  rect(c, 5, -31 + lean, 3, 5, a.hair);
  if (state.direction !== 3) {
    rect(c, state.direction === 1 ? 2 : -3, -26 + lean, 2, 2, a.eyes);
    if (state.direction === 0) rect(c, 3, -26 + lean, 2, 2, a.eyes);
  } else rect(c, -5, -30 + lean, 10, 7, a.hair);
  if (state.outfit === "rice" && state.direction !== 3)
    label(c, "RICE", 0, -14, 4, "#e7e8d3");
  c.restore();
}
export function bella(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  pet: boolean,
  reduced: boolean,
) {
  const a = appearance.bella;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  ellipse(c, 0, 1, 10, 3, "#3d56564d");
  rect(c, -7, -10, 13, 9, a.coat);
  rect(c, -9, -8, 3, 5, a.light);
  rect(c, -5, -2, 3, 5, a.ears);
  rect(c, 3, -2, 3, 5, a.ears);
  rect(c, 2, -17, 10, 11, a.coat);
  rect(c, 0, -21, 4, 10, a.ears);
  rect(c, 10, -21, 4, 10, a.ears);
  rect(c, 1, -17, 3, 8, a.light);
  rect(c, 11, -16, 3, 8, a.light);
  rect(c, 5, -9, 6, 3, a.light);
  rect(c, 5, -13, 1, 2, "#353f36");
  rect(c, 10, -13, 1, 2, "#353f36");
  rect(c, 8, -10, 2, 2, "#353f36");
  const wag = !reduced && Math.sin(t * (pet ? 30 : 3)) > 0 ? 3 : 0;
  rect(c, -12, -14 + wag, 5, 10, a.light);
  rect(c, -14, -16 + wag, 5, 5, a.light);
  c.restore();
}
export function render(
  c: CanvasRenderingContext2D,
  state: RenderState,
  viewport: Point,
  camera: Point,
) {
  const { scene, player, time, reduced } = state;
  const d = dimensions(scene);
  rect(c, 0, 0, viewport.x, viewport.y, "#8fa99f");
  c.save();
  c.translate(-Math.round(camera.x), -Math.round(camera.y));
  if (scene === "street") street(c, time, reduced);
  else interior(c, scene);
  for (const s of spots(scene)) {
    const near = Math.hypot(s.x - player.x, s.y - player.y) < 32;
    ellipse(
      c,
      s.x,
      s.y + 2,
      near ? 10 : 6,
      near ? 4 : 2,
      near ? "#f5e9b4" : "#e2dab491",
    );
    if (s.door) {
      label(c, "⌄", s.x, s.y - 5, 12, "#fff5cd");
    }
  }
  const actors = [
    { y: player.y, draw: () => michael(c, player.x, player.y, state) },
    {
      y: state.bella.y,
      draw: () =>
        bella(c, state.bella.x, state.bella.y, time, state.pet > 0, reduced),
    },
  ];
  actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
  if (state.pet > 0) {
    label(
      c,
      "♥",
      state.bella.x + 2,
      state.bella.y - 29 - (reduced ? 0 : (1 - state.pet / 1.5) * 12),
      15,
      "#ac5c58",
    );
  }
  if (scene === "street" && !reduced) {
    c.globalAlpha = 0.1;
    for (let i = 0; i < 4; i++) {
      const x = ((time * 5 + i * 251) % (d.w + 200)) - 100;
      ellipse(c, x, 110 + i * 136, 125, 13, "#eef0da");
      ellipse(c, x + 80, 103 + i * 136, 105, 9, "#eef0da");
    }
    c.globalAlpha = 1;
  }
  c.restore();
}
