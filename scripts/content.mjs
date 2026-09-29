import { readFile, writeFile } from "node:fs/promises";
import { stories, statusLabel } from "../src/game/content.ts";
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
let page = await readFile("portfolio.html", "utf8");
const html = ["matcha", "books", "alley", "view"]
  .map((id) => {
    const s = stories[id];
    return `<article><p class="nb-kicker">${escape(statusLabel[s.status])}</p><h3>${escape(s.title)}</h3><p>${escape(s.text)}</p></article>`;
  })
  .join("");
page = page
  .replace(
    /<div id="memory-list">[\s\S]*?<\/div>/,
    `<div id="memory-list">${html}</div>`,
  )
  .replace(/<noscript>[\s\S]*?<\/noscript>/, "")
  .replace('<script type="module" src="/src/portfolio.ts"></script>', "");
await writeFile("portfolio.html", page);
