import { appearance } from "./config";
import { PET_DURATION, type CompanionPose } from "./companion";
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
  bellaPose: CompanionPose;
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
// Original 3×5 lettering: the same logical pixel grid as the scenery.
const glyphs: Record<string, string> = {
  A: "010101111101101",
  B: "110101110101110",
  C: "011100100100011",
  D: "110101101101110",
  E: "111100110100111",
  F: "111100110100100",
  G: "011100101101011",
  H: "101101111101101",
  I: "111010010010111",
  J: "001001001101010",
  K: "101101110101101",
  L: "100100100100111",
  M: "101111111101101",
  N: "101111111111101",
  O: "010101101101010",
  P: "110101110100100",
  Q: "010101101111011",
  R: "110101110101101",
  S: "011100010001110",
  T: "111010010010010",
  U: "101101101101111",
  V: "101101101101010",
  W: "101101111111101",
  X: "101101010101101",
  Y: "101101010010010",
  Z: "111001010100111",
  ".": "000000000000010",
  "↓": "010010010111010",
  "↗": "111001101100100",
  "⌄": "000000101010000",
  "♥": "000101111111010",
  "—": "000000111000000",
};
function label(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 9,
  color = C.ink,
) {
  const scale = size >= 9 ? 2 : 1;
  const letters = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  const start = Math.round(x - ((letters.length * 4 - 1) * scale) / 2);
  [...letters].forEach((letter, i) => {
    const glyph = glyphs[letter];
    if (!glyph) return;
    [...glyph].forEach((on, j) => {
      if (on === "1")
        rect(
          c,
          start + i * 4 * scale + (j % 3) * scale,
          y - 5 * scale + Math.floor(j / 3) * scale,
          scale,
          scale,
          color,
        );
    });
  });
}
function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  // Stepped scanlines keep shadows, light pools and mist on the pixel grid.
  for (let row = -Math.ceil(ry); row <= Math.ceil(ry); row++) {
    const width = Math.floor(
      rx * Math.sqrt(Math.max(0, 1 - (row * row) / (ry * ry))),
    );
    if (width) rect(c, x - width, y + row, width * 2, 1, color);
  }
}
function cup(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  matcha = false,
) {
  ellipse(c, x + 5, y + 8, 9, 3, "#e7d5ac");
  rect(c, x, y, 10, 8, "#fff0cc");
  rect(c, x + 10, y + 2, 3, 4, "#fff0cc");
  rect(c, x + 2, y, 6, 2, matcha ? "#8a9b65" : "#745440");
  const drift = Math.sin(t * 1.2) > 0 ? 1 : 0;
  rect(c, x + 3, y - 5, 1, 3, "#f7e7bf99");
  rect(c, x + 4 + drift, y - 9, 1, 3, "#f7e7bf66");
}
function rug(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  rect(c, x, y, w, h, color);
  rect(c, x + 3, y + 3, w - 6, 1, "#dac295");
  rect(c, x + 3, y + h - 4, w - 6, 1, "#dac295");
  for (let i = 7; i < w - 4; i += 10) {
    rect(c, x + i, y + 7, 3, 2, "#dac29577");
    rect(c, x + i, y + h - 9, 3, 2, "#dac29577");
  }
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
  if (d.id === "books") {
    for (let i = 0; i < 4; i++) {
      const wx = x + 16 + (i * (w - 30)) / 4;
      rect(c, wx - 4, y + 38, 32, 3, "#eee4c6");
      rect(c, wx - 4, y + 70, 32, 3, "#eee4c6");
    }
  }
  if (d.id === "vesuvio") {
    for (let i = 0; i < 4; i++) {
      const wx = x + 16 + (i * (w - 30)) / 4;
      rect(c, wx - 3, y + 38, 30, 3, "#bdab79");
      rect(c, wx + 4, y + 43, 3, 22, "#a98f63");
      rect(c, wx + 17, y + 43, 3, 22, "#a98f63");
    }
  }
  // Distinct shopfront joinery, all inside the existing building footprints.
  if (d.id === "trieste") {
    rect(c, x + 6, y + 104, w - 12, 3, "#425f52");
    for (const px of [x + 15, x + 63]) {
      rect(c, px, dy + 22, 34, 6, "#805e48");
      cup(c, px + 8, dy + 17, 0);
    }
    rect(c, x + w - 61, dy + 3, 44, 24, "#714f3f");
    label(c, "CAFFE", x + w - 39, dy + 13, 7, "#efd195");
    label(c, "ESPRESSO", x + w - 39, dy + 23, 7, "#efd195");
    rect(c, x + 3, y + 34, w - 6, 3, "#cfaa80");
  } else if (d.id === "books") {
    rect(c, x + 8, y + 35, w - 16, 4, "#f0e4bd");
    rect(c, x + w - 19, y + 40, 15, 62, "#eee3bf");
    [..."BOOKS"].forEach((v, i) =>
      label(c, v, x + w - 11, y + 49 + i * 10, 7, "#455a51"),
    );
    for (const px of [x + 15, x + 63]) {
      rect(c, px, dy + 18, 34, 10, "#52675c");
      for (let i = 0; i < 7; i++)
        rect(
          c,
          px + 2 + i * 4,
          dy + 19 + (i % 2),
          3,
          7,
          ["#b77961", "#dfcea5", "#799586"][i % 3],
        );
    }
    label(c, "BOOKS • POETRY", x + w / 2, y + 77, 7, "#42574f");
  } else {
    rect(c, x + 5, y + 35, w - 10, 4, "#c2a26f");
    rect(c, x + w - 60, dy + 2, 46, 27, "#3b5753");
    for (let i = 0; i < 4; i++)
      rect(
        c,
        x + w - 57 + i * 11,
        dy + 5,
        7,
        18,
        ["#b58458", "#869582", "#b16b58", "#d0b777"][i],
      );
    label(c, "CAFE", x + w - 36, dy + 26, 7, "#f4dbac");
    // A small original sunburst medallion and painted frieze.
    for (let i = 0; i < 8; i++)
      rect(c, x + 10 + i * 23, y + 73, 12, 3, i % 2 ? "#b7a674" : "#596f61");
    rect(c, x + w - 14, y + 7, 7, 21, "#b98859");
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
  for (let y = 0; y < 650; y++) {
    const left = 115 + (236 * y) / 650,
      right = 239 + (262 * y) / 650;
    rect(c, left, y, Math.round(right - left), 1, C.pavement);
    const roadLeft = 139 + (243 * y) / 650,
      roadRight = 214 + (256 * y) / 650;
    rect(c, roadLeft, y, Math.round(roadRight - roadLeft), 1, C.road);
  }
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
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 8; col++)
      rect(
        c,
        302 + col * 8 + (row % 2) * 3,
        421 + row * 7,
        6,
        5,
        (row + col) % 3 ? "#c5b798" : "#b5a88e",
      );
  rect(c, 303, 420, 62, 2, "#827e68");
  for (let i = 0; i < 5; i++) {
    rect(c, 305 + i * 12, 417, 5, 3, "#ecce91");
    rect(c, 307 + i * 12, 415, 1, 2, "#657368");
  }
  // Painted wall tiles and a climbing vine frame the alley, leaving its path clear.
  for (let i = 0; i < 5; i++)
    rect(c, 303, 428 + i * 5, 2, 3, i % 2 ? "#657d69" : "#b57961");
  plant(c, 357, 454);
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
  rect(c, x + 3, y + h, w - 3, 3, "#6d584455");
  rect(c, x, y, w, h, "#69523e");
  const rows = h > 30 ? 2 : 1,
    rowHeight = Math.floor((h - 5) / rows);
  for (let row = 0; row < rows; row++) {
    const baseline = y + 3 + (row + 1) * rowHeight;
    for (let i = 0; i < Math.floor((w - 10) / 7); i++) {
      const height = rowHeight - 3 - (i % 3),
        bx = x + 5 + i * 7;
      rect(
        c,
        bx,
        baseline - height,
        5,
        height,
        ["#9e6654", "#ccb579", "#76998b", "#dbccb0", "#788b9e"][i % 5],
      );
      rect(c, bx + 1, baseline - height + 2, 3, 1, "#eee0ba88");
    }
    rect(c, x + 2, baseline, w - 4, 2, "#c29e70");
  }
  rect(c, x, y, 3, h, "#9b7954");
  rect(c, x + w - 3, y, 3, h, "#9b7954");
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
function interior(c: CanvasRenderingContext2D, s: SceneId, t: number) {
  rect(c, 0, 0, 520, 390, "#718c83");
  rect(c, 30, 33, 460, 324, "#4a635b");
  rect(
    c,
    40,
    43,
    440,
    304,
    s === "books" ? "#c6aa7e" : s === "vesuvio" ? "#927762" : "#cdbb95",
  );
  for (let y = 45; y < 345; y += 16) {
    rect(c, 41, y, 438, 1, "#a08a6944");
    for (let x = 45 + (y % 32 ? 0 : 24); x < 475; x += 48)
      rect(c, x, y, 1, 16, "#a08a6944");
  }
  rect(
    c,
    38,
    39,
    444,
    32,
    s === "vesuvio" ? "#654e4a" : s === "trieste" ? "#9d765c" : "#87988a",
  );
  rect(c, 38, 65, 444, 5, "#617467");
  windowArt(c, 50, 124, 18, 80);
  windowArt(c, 452, 124, 18, 80);
  // Soft, stepped morning light, below furniture and characters.
  for (let i = 0; i < 6; i++) {
    rect(c, 69 + i * 5, 135 + i * 6, 36 - i * 4, 61 - i * 6, "#f4d99c0a");
    rect(c, 415 + i * 5, 135 + i * 6, 36 - i * 4, 61 - i * 6, "#f4d99c0a");
  }
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
    rect(c, 74, 91, 372, 2, "#644b3e");
    for (let x = 80; x < 440; x += 46) {
      rect(c, x, 98, 39, 17, "#a67e56");
      rect(c, x + 3, 101, 33, 1, "#be986c");
    }
    rect(c, 94, 82, 80, 3, "#314f50");
    for (let x = 99; x < 167; x += 6) rect(c, x, 86, 3, 2, "#c4cbbb");
    rect(c, 177, 68, 12, 20, "#4b5e55");
    rect(c, 179, 62, 8, 7, "#8a6547");
    cup(c, 354, 76, t, true);
    cup(c, 277, 77, t);
    // Pendants cast quiet pools of amber over the counter.
    for (const x of [238, 394]) {
      rect(c, x, 64, 1, 8, "#514e3c");
      rect(c, x - 7, 71, 15, 4, "#c59b60");
      rect(c, x - 5, 75, 11, 2, "#f5deaa");
    }
    table(c, 96, 178, 65, 48);
    table(c, 342, 186, 65, 48);
    rect(c, 316, 240, 24, 12, "#7a614d");
    rect(c, 315, 231, 4, 18, "#937655");
    rect(c, 315, 231, 25, 4, "#937655");
    label(c, "MATCHA", 362, 108, 7, "#f5e4b7");
    cup(c, 114, 188, t);
    cup(c, 361, 196, t, true);
    rug(c, 182, 267, 125, 29, "#a27a5c");
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
    for (const [x, y] of [
      [76, 157],
      [324, 157],
      [76, 238],
    ]) {
      rect(c, x + 26, y - 19, 64, 15, "#e6d5aa");
    }
    rect(c, 213, 77, 38, 24, "#dfd0a7");
    label(c, "OPEN", 232, 87, 7);
    label(c, "A BOOK", 232, 96, 7);
    label(c, "FICTION", 134, 153, 9);
    label(c, "POETRY", 382, 153, 9);
    label(c, "TRAVEL", 134, 234, 9);
    rug(c, 309, 257, 108, 40, "#8c9b80");
    label(c, "READ A LITTLE.", 362, 280, 8);
  }
  if (s === "vesuvio") {
    rect(c, 70, 75, 245, 45, "#785b45");
    rect(c, 68, 75, 249, 7, "#cb9e6d");
    for (let i = 0; i < 8; i++) {
      rect(c, 82 + i * 27, 61, 8, 15, ["#638478", "#ac8764", "#b59c6e"][i % 3]);
      rect(c, 84 + i * 27, 58, 4, 5, "#cfc19b");
    }
    for (let x = 77; x < 305; x += 38) {
      rect(c, x, 87, 30, 26, "#5e4840");
      rect(c, x + 3, 90, 24, 2, "#a57c54");
    }
    rug(c, 192, 216, 135, 64, "#805957");
    for (const x of [108, 185, 262]) {
      rect(c, x, 122, 16, 7, "#674b46");
      rect(c, x + 2, 129, 2, 7, "#554e43");
      rect(c, x + 12, 129, 2, 7, "#554e43");
    }
    table(c, 370, 184, 55, 48);
    table(c, 104, 206, 55, 48);
    for (let i = 0; i < 3; i++) {
      rect(c, 341 + i * 41, 81, 33, 37, "#72573f");
      rect(c, 345 + i * 41, 85, 25, 29, ["#b79970", "#74958b", "#b07960"][i]);
      rect(c, 352 + i * 41, 94, 12, 13, "#d9c39a");
    }
    for (let i = 0; i < 3; i++) {
      rect(c, 347 + i * 41, 88, 4, 13, "#536e62");
      rect(c, 351 + i * 41, 99, 14, 3, "#d3bd8e");
    }
    cup(c, 384, 196, t);
    cup(c, 115, 218, t);
  }
  if (s === "tower") {
    // An interpreted panorama within the original observation-wall footprint.
    rect(c, 77, 37, 366, 79, "#667e78");
    rect(c, 82, 41, 356, 69, "#c5d3c5");
    for (let x = 82; x < 438; x += 4) {
      const hill = 58 + Math.round(5 * Math.sin(x / 43) + 3 * Math.sin(x / 19));
      rect(c, x, hill, 4, 34, "#9bb4a8");
    }
    rect(c, 82, 76, 356, 34, "#809f9f");
    for (let i = 0; i < 20; i++)
      rect(c, 88 + i * 17, 82 + (i % 4) * 5, 10, 1, "#c6d3bd66");
    // Bay bridge silhouette, sailboat and layered waterfront roofs.
    rect(c, 286, 65, 142, 2, "#607e7c");
    for (const x of [315, 386]) {
      rect(c, x, 49, 3, 29, "#607e7c");
      rect(c, x - 2, 49, 7, 2, "#607e7c");
    }
    for (let i = 0; i < 17; i++) {
      const x = 295 + i * 8;
      rect(
        c,
        x,
        56 + Math.round(8 * Math.sin((i / 16) * Math.PI)),
        1,
        7,
        "#728e86",
      );
    }
    rect(c, 222, 87, 1, 11, "#e6dcb7");
    rect(c, 217, 96, 13, 2, "#4f777b");
    for (let i = 0; i < 7; i++) rect(c, 222 - i, 89 + i, 1, 7 - i, "#f0e3bf");
    for (let i = 0; i < 18; i++) {
      const h = 8 + ((i * 7) % 19);
      rect(c, 84 + i * 20, 109 - h, 16, h, i % 2 ? "#6a8780" : "#81988a");
      rect(c, 87 + i * 20, 112 - h, 3, 2, "#c6ceae");
    }
    for (let x = 80; x < 440; x += 72) rect(c, x, 38, 4, 77, "#e0d5b4");
    rect(c, 77, 111, 366, 5, "#ede2c2");
    label(c, "THE BAY, THROUGH THE FOG", 260, 157, 9, "#526c66");
    for (const [x, w] of [
      [90, 90],
      [345, 85],
    ]) {
      rect(c, x + 4, 250, w - 8, 4, "#9a927888");
      rect(c, x, 230, w, 20, "#a78d67");
      for (let y = 233; y < 248; y += 5) rect(c, x + 3, y, w - 6, 2, "#d1ba8d");
    }
    rug(c, 229, 215, 60, 47, "#a4aa90");
    label(c, "SF", 260, 243, 19, "#607c72");
  }
}
export function michael(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: Pick<
    RenderState,
    "outfit" | "walking" | "direction" | "time" | "pet" | "sitting" | "reduced"
  > & { petSide?: number },
  scale = 1,
) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale(scale, scale);
  const a = appearance.michael;
  const step =
    state.walking && !state.reduced
      ? Math.sin(state.time * 13) > 0
        ? 2
        : -2
      : 0;
  const reaching = state.pet > PET_DURATION - 0.5;
  const lean = reaching
    ? 2
    : !state.walking && !state.reduced && Math.sin(state.time * 1.4) > 0.8
      ? 1
      : 0;
  ellipse(c, 0, 1, 9, 3, "#3d56564d");
  rect(c, -5, -8, 4, 8 + (state.sitting ? -3 : step), a.jeans);
  rect(c, 2, -8, 4, 8 - (state.sitting ? 3 : step), a.jeans);
  rect(c, -6, step, 5, 3, "#394c4b");
  rect(c, 2, -step, 5, 3, "#394c4b");
  rect(c, -8, -21, 16, 14, state.outfit === "rice" ? a.rice : a.sweater);
  rect(c, -6, -8, 12, 1, "#354d5c");
  rect(c, -3, -22, 6, 3, a.skin);
  rect(c, -7, -20, 2, 11, state.outfit === "rice" ? "#395970" : "#96563f");
  rect(c, -10, -20 + lean, 3, 12, a.skin);
  rect(c, 7, -20 + lean, 3, 12, a.skin);
  rect(c, -6, -32 + lean, 12, 12, a.skin);
  rect(c, -7, -34 + lean, 14, 5, a.hair);
  rect(c, -7, -31 + lean, 3, 7, a.hair);
  rect(c, 5, -31 + lean, 3, 5, a.hair);
  if (state.direction !== 3) {
    rect(c, state.direction === 1 ? 2 : -3, -26 + lean, 2, 2, a.eyes);
    if (state.direction === 0) rect(c, 3, -26 + lean, 2, 2, a.eyes);
  } else rect(c, -5, -30 + lean, 10, 7, a.hair);
  if (state.outfit === "rice") {
    rect(c, -10, -20 + lean, 3, 4, a.rice);
    rect(c, 7, -20 + lean, 3, 4, a.rice);
  }
  if (state.outfit === "rice" && state.direction !== 3)
    label(c, "RICE", 0, -12, 5, "#e7e8d3");
  if (state.outfit === "sweater") {
    rect(c, -10, -20 + lean, 3, 8, a.sweater);
    rect(c, 7, -20 + lean, 3, 8, a.sweater);
    if (state.direction !== 3) {
      rect(c, -1, -20, 3, 8, "#804c3e");
      rect(c, 0, -18, 1, 1, "#e2c297");
      rect(c, 0, -15, 1, 1, "#e2c297");
    }
  }
  if (reaching) {
    const side = state.petSide ?? 1;
    const stroke = state.reduced
      ? 0
      : Math.sin((PET_DURATION - state.pet) * 18) > 0
        ? 1
        : 0;
    if (state.direction === 0) {
      rect(c, side < 0 ? -6 : 3, -8 + stroke, 4, 6, a.skin);
      rect(c, side < 0 ? -5 : 2, -3 + stroke, 4, 2, a.skin);
    } else if (state.direction === 3) {
      rect(c, side < 0 ? -10 : 7, -25 + stroke, 3, 6, a.skin);
    } else {
      rect(c, side < 0 ? -14 : 8, -13 + stroke, 6, 3, a.skin);
      rect(c, side < 0 ? -16 : 12, -11 + stroke, 4, 2, a.skin);
    }
  }
  rect(c, -4, -32 + lean, 7, 1, "#74523b");
  c.restore();
}
export function bella(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  pet: boolean,
  reduced: boolean,
  pose: CompanionPose = { mode: "watch", facing: 0, stride: 0 },
) {
  const a = appearance.bella;
  const walking = pose.mode === "follow",
    settled = pose.mode === "settled";
  const step = walking && !reduced ? (Math.sin(pose.stride) > 0 ? 1 : -1) : 0;
  const bob = walking && !reduced && Math.sin(pose.stride * 2) > 0 ? 1 : 0;
  const dip =
    pose.mode === "sniff" && !reduced ? 3 + (Math.sin(t * 7) > 0 ? 1 : 0) : 0;
  const wag =
    !reduced && (pet || walking)
      ? Math.sin(pet ? t * 17 : pose.stride) > 0
        ? 1
        : -1
      : 0;
  const side = pose.facing === 1 || pose.facing === 2;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  ellipse(c, 0, 1, 9, 3, "#3d56564d");
  if (pose.facing === 2) c.scale(-1, 1);
  // Tail curls over the back; separated tufts read as long fur, not a solid flag.
  const tx = side ? -9 : 7,
    ty = -12 + (settled ? 3 : 0) + wag;
  rect(c, tx, ty, 4, 8, a.light);
  rect(c, tx - 3, ty - 3, 5, 5, a.light);
  rect(c, tx - 4, ty - 1, 2, 3, a.light);
  rect(c, tx - 1, ty - 5, 5, 3, a.light);
  rect(c, tx + 3, ty - 4, 3, 3, a.light);
  rect(c, tx + 1, ty - 1, 2, 5, a.coat);
  // Four alternating feet, driven by actual distance along the trail.
  for (const [fx, phase] of [
    [-5, 1],
    [3, -1],
    [-2, -1],
    [6, 1],
  ]) {
    rect(c, fx, -3, 2, settled ? 3 : 5 + step * phase, a.ears);
    rect(c, fx, -1 + (settled ? 1 : step * phase), 3, 2, a.light);
  }
  rect(c, -7, -10 + (settled ? 3 : bob), 14, 8, a.coat);
  rect(c, -7, -7 + (settled ? 3 : bob), 3, 5, a.light);
  rect(c, -4, -5 + (settled ? 3 : bob), 2, 4, a.light);
  const hx = side ? 5 : 0,
    hy = -16 + dip + bob + (settled ? 4 : 0);
  rect(c, hx - 5, hy, 10, 10, a.coat);
  // Broad ear bases, dark inner ears, and asymmetric feather tips.
  for (const ex of [hx - 6, hx + 3]) {
    rect(c, ex, hy - 5, 3, 7, a.coat);
    rect(c, ex - 1, hy - 2, 5, 5, a.coat);
    rect(c, ex + 1, hy - 3, 1, 4, a.ears);
  }
  rect(c, hx - 7, hy + 5, 3, 5, a.light);
  rect(c, hx + 5, hy + 4, 3, 6, a.light);
  rect(c, hx - 4, hy + 8, 9, 3, a.light);
  rect(c, hx - 2, hy + 11, 5, 2, a.light);
  if (pose.facing !== 3) {
    if (side) {
      rect(c, hx + 1, hy + 4, 2, 2, "#353f36");
      rect(c, hx + 4, hy + 7, 5, 3, a.light);
      rect(c, hx + 8, hy + 7, 2, 2, "#353f36");
    } else {
      rect(c, hx - 3, hy + 4, 2, 2, "#353f36");
      rect(c, hx + 2, hy + 4, 2, 2, "#353f36");
      rect(c, hx - 2, hy + 7, 5, 3, a.light);
      rect(c, hx, hy + 7, 2, 2, "#353f36");
    }
  } else {
    rect(c, -3, hy + 2, 6, 6, a.coat);
    rect(c, -2, hy + 9, 5, 3, a.light);
  }
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
  else interior(c, scene, reduced ? 0 : time);
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
    {
      y: player.y,
      draw: () =>
        michael(c, player.x, player.y, {
          ...state,
          petSide: state.bella.x < player.x ? -1 : 1,
        }),
    },
    {
      y: state.bella.y,
      draw: () =>
        bella(
          c,
          state.bella.x,
          state.bella.y,
          time,
          state.pet > 0,
          reduced,
          state.bellaPose,
        ),
    },
  ];
  actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
  if (state.pet > 0) {
    label(
      c,
      "♥",
      state.bella.x + (player.x >= state.bella.x ? -12 : 12),
      state.bella.y - 25 - (reduced ? 0 : (1 - state.pet / PET_DURATION) * 5),
      7,
      "#ac5c58",
    );
  }
  if (scene === "street" && !reduced) {
    c.globalAlpha = 0.055;
    for (let i = 0; i < 4; i++) {
      const x = ((time * 5 + i * 251) % (d.w + 200)) - 100;
      ellipse(c, x, 110 + i * 136, 125, 13, "#eef0da");
      ellipse(c, x + 80, 103 + i * 136, 105, 9, "#eef0da");
    }
    c.globalAlpha = 1;
  }
  c.restore();
}
