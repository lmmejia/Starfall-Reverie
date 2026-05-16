/**
 * Generates css/story-pixel-scenes.css — run: node tools/gen-story-pixel-css.mjs
 * @format
 */
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const W = 72;
const H = 40;

/** @param {number} x @param {number} y @param {number} rw @param {number} rh @param {string} fill */
function R(x, y, rw, rh, fill) {
  return `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${fill}"/>`;
}

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${inner}</svg>`;
}

function stars(seed, n, y0, y1, c) {
  let s = "";
  let r = seed;
  for (let i = 0; i < n; i++) {
 r = (r * 1103515245 + 12345) % 2147483648;
 const x = (r >>> 0) % W;
 r = (r * 1103515245 + 12345) % 2147483648;
 const y = y0 + ((r >>> 0) % (y1 - y0));
 s += R(x, y, 1, 1, c);
  }
  return s;
}

function brickWall(x0, y0, cw, ch, rows, c1, c2) {
  let o = "";
  for (let row = 0; row < rows; row++) {
 const y = y0 + row * ch;
 const off = row % 2 === 0 ? 0 : Math.floor(cw / 2);
 for (let col = -1; col < Math.ceil((cw + off) / cw) + 1; col++) {
   const x = x0 + col * cw + off;
   o += R(x, y, cw - 1, ch - 1, (col + row) % 2 === 0 ? c1 : c2);
 }
  }
  return o;
}

/** @type {Record<string, string>} */
const scenes = {
  gate: svg(
    R(0, 0, W, H, "#2d1c40") +
      stars(42, 55, 2, 22, "#ffe8ff") +
      R(0, 28, W, 12, "#e8a8d8") +
      R(4, 26, 64, 2, "#c878b0") +
      R(10, 18, 6, 14, "#ffd0e8") +
      R(22, 12, 28, 6, "#ffb8d0") +
      R(22, 18, 4, 14, "#ffd0e8") +
      R(46, 18, 4, 14, "#ffd0e8") +
      R(56, 18, 6, 14, "#ffd0e8") +
      R(16, 8, 40, 8, "#ff90b8") +
      R(34, 6, 4, 4, "#fff0f8"),
  ),

  street: svg(
    R(0, 0, W, H, "#ffd8a0") +
      R(0, 0, W, 16, "#ffeec8") +
      R(2, 18, 12, 20, "#ff98c0") +
      R(16, 14, 10, 24, "#88d8f0") +
      R(28, 20, 14, 18, "#c8f090") +
      R(44, 12, 11, 26, "#ffa8d0") +
      R(58, 16, 12, 22, "#78c8e8") +
      R(0, 32, W, 8, "#f0b090") +
      R(0, 30, W, 2, "#d89878") +
      stars(7, 12, 4, 12, "#ffffff"),
  ),

  evening: svg(
    R(0, 0, W, H, "#4a2860") +
      R(0, 20, W, 20, "#ff7090") +
      R(0, 14, W, 10, "#ffb860") +
      R(0, 8, W, 8, "#a860a0") +
      stars(99, 40, 2, 12, "#fff0ff") +
      R(0, 34, W, 6, "#301848") +
      R(8, 28, 8, 10, "#201030") +
      R(50, 26, 14, 12, "#201030"),
  ),

  tram: svg(
    R(0, 0, W, H, "#305878") +
      R(0, 24, W, 16, "#204060") +
      R(6, 10, 60, 20, "#fff8e8") +
      R(8, 12, 8, 16, "#b8e8ff") +
      R(20, 12, 8, 16, "#ffe8c8") +
      R(32, 12, 8, 16, "#b8e8ff") +
      R(44, 12, 8, 16, "#ffe8c8") +
      R(56, 12, 8, 16, "#b8e8ff") +
      R(6, 8, 60, 4, "#d06060") +
      R(4, 28, 4, 4, "#303030") +
      R(64, 28, 4, 4, "#303030"),
  ),

  stage: svg(
    R(0, 0, W, 18, "#080410") +
      R(0, 18, W, 22, "#2a1830") +
      R(0, 10, 14, 30, "#601028") +
      R(58, 10, 14, 30, "#601028") +
      R(14, 10, 44, 6, "#801038") +
      R(28, 4, 16, 28, "#fff8c0") +
      R(30, 6, 12, 20, "#fffee8") +
      R(0, 34, W, 6, "#1a1020") +
      R(20, 32, 32, 2, "#ffd700"),
  ),

  descent: svg(
    R(0, 0, W, H, "#0c0818") +
      R(0, 0, W, 8, "#181028") +
      brickWall(0, 8, 8, 4, 8, "#2a2040", "#1a1830") +
      R(0, 24, 36, 16, "#120c20") +
      R(36, 20, 36, 20, "#0a0814") +
      R(8, 26, 4, 2, "#486078") +
      R(16, 30, 4, 2, "#486078") +
      R(24, 34, 4, 2, "#486078"),
  ),

  vault: svg(
    R(0, 0, W, H, "#12101c") +
      R(0, 30, W, 10, "#0a0812") +
      brickWall(0, 8, 6, 5, 5, "#3a4860", "#283448") +
      R(28, 14, 16, 16, "#406878") +
      R(30, 16, 12, 12, "#508898") +
      stars(3, 8, 4, 10, "#a0d8e8"),
  ),

  pods: svg(
    R(0, 0, W, H, "#140c20") +
      R(0, 0, W, 4, "#1a1030") +
      R(8, 6, 1, 8, "#403050") +
      R(22, 4, 1, 10, "#403050") +
      R(36, 7, 1, 9, "#403050") +
      R(50, 5, 1, 10, "#403050") +
      R(64, 8, 1, 8, "#403050") +
      R(6, 12, 10, 14, "#c0fff0") +
      R(20, 10, 10, 16, "#b0f8e8") +
      R(34, 13, 10, 14, "#d0ffff") +
      R(48, 11, 10, 15, "#b0f0e0") +
      R(62, 14, 8, 12, "#c8fff8") +
      R(6, 12, 10, 2, "#e8ffff") +
      R(20, 10, 10, 2, "#e8ffff") +
      R(34, 13, 10, 2, "#e8ffff") +
      R(48, 11, 10, 2, "#e8ffff") +
      R(62, 14, 8, 2, "#e8ffff"),
  ),

  tether: svg(
    R(0, 0, W, H, "#100818") +
      stars(11, 70, 2, 38, "#604878") +
      R(18, 0, 2, H, "#704898") +
      R(36, 0, 2, H, "#8060a8") +
      R(54, 0, 2, H, "#604878") +
      R(17, 20, 4, 4, "#b080d0") +
      R(35, 28, 4, 4, "#c090e0") +
      R(53, 16, 4, 4, "#b080d0"),
  ),

  deep: svg(
    R(0, 0, W, H, "#06040c") +
      R(28, 16, 16, 8, "#102040") +
      R(30, 18, 12, 4, "#204878") +
      stars(77, 35, 2, 35, "#383058"),
  ),

  chorus: svg(
    R(0, 0, W, H, "#180820") +
      R(0, 28, W, 12, "#0c0410") +
      R(4, 18, 6, 12, "#402850") +
      R(14, 17, 6, 13, "#483060") +
      R(24, 18, 6, 12, "#402850") +
      R(34, 17, 6, 13, "#503070") +
      R(44, 18, 6, 12, "#402850") +
      R(54, 17, 6, 13, "#483060") +
      R(64, 18, 6, 12, "#402850") +
      R(7, 14, 2, 2, "#ffd0f0") +
      R(17, 13, 2, 2, "#ffd0f0") +
      R(27, 14, 2, 2, "#ffd0f0") +
      R(37, 13, 2, 2, "#ffd0f0") +
      R(47, 14, 2, 2, "#ffd0f0") +
      R(57, 13, 2, 2, "#ffd0f0") +
      R(67, 14, 2, 2, "#ffd0f0"),
  ),

  chamber: svg(
    R(0, 0, W, H, "#0c0818") +
      R(0, 0, W, 6, "#181028") +
      R(0, 6, 8, 30, "#2a2040") +
      R(64, 6, 8, 30, "#2a2040") +
      R(8, 30, 56, 10, "#1a1028") +
      R(30, 14, 12, 16, "#408868") +
      R(32, 16, 8, 12, "#60c8a0") +
      R(34, 18, 4, 8, "#a0ffe0"),
  ),

  beast: svg(
    R(0, 0, W, H, "#080410") +
      R(10, 8, 52, 28, "#201038") +
      R(20, 10, 32, 22, "#402868") +
      R(28, 14, 16, 14, "#604898") +
      R(32, 18, 4, 4, "#fff0ff") +
      R(40, 18, 4, 4, "#fff0ff") +
      R(34, 24, 10, 4, "#8060c0") +
      R(0, 32, W, 8, "#040208") +
      stars(5, 25, 2, 10, "#604070"),
  ),

  ascent: svg(
    R(0, 0, W, H, "#180828") +
      R(24, 0, 24, 8, "#ffd8a0") +
      R(28, 8, 16, 4, "#ffe8c0") +
      R(0, 20, 32, 20, "#120818") +
      R(40, 18, 32, 22, "#0c0510") +
      R(8, 26, 4, 2, "#586078") +
      R(18, 30, 4, 2, "#586078") +
      R(50, 28, 4, 2, "#586078") +
      R(60, 32, 4, 2, "#586078"),
  ),

  rotunda: svg(
    R(0, 0, W, H, "#100820") +
      R(8, 0, 56, 14, "#201038") +
      R(16, 2, 40, 10, "#ffd8a8") +
      R(20, 4, 32, 6, "#fff0d0") +
      R(0, 28, W, 12, "#181028") +
      R(30, 20, 12, 12, "#403058") +
      R(0, 14, W, 4, "#2a1838"),
  ),

  planetarium: svg(
    R(0, 0, W, H, "#040410") +
      R(4, 8, 64, 24, "#080818") +
      R(6, 10, 60, 14, "#101428") +
      stars(31, 100, 12, 22, "#ffffff") +
      stars(44, 40, 12, 22, "#a0c0ff") +
      R(0, 32, W, 8, "#060608") +
      R(28, 32, 16, 2, "#304060"),
  ),

  orrery: svg(
    R(0, 0, W, H, "#080618") +
      R(30, 16, 12, 12, "#ffd848") +
      R(32, 18, 8, 8, "#fff090") +
      R(20, 20, 32, 1, "#604878") +
      R(26, 14, 20, 1, "#8060a0") +
      R(24, 26, 24, 1, "#504068") +
      R(36, 10, 4, 4, "#90c8ff") +
      R(48, 24, 3, 3, "#c09060") +
      R(16, 22, 3, 3, "#90d8c0") +
      R(0, 34, W, 6, "#0c0818"),
  ),

  veil: svg(
    R(0, 0, W, H, "#280818") +
      R(0, 0, 24, H, "#501028") +
      R(48, 0, 24, H, "#501028") +
      R(20, 0, 32, H, "#702040") +
      R(22, 0, 28, H, "#903050") +
      R(30, 8, 12, 24, "#b04060") +
      stars(66, 30, 4, 36, "#401020"),
  ),

  eclipse: svg(
    R(0, 0, W, H, "#020004") +
      stars(8, 120, 2, 38, "#403060") +
      R(28, 14, 16, 16, "#080610") +
      R(30, 16, 12, 12, "#ffb020") +
      R(32, 18, 8, 8, "#000000"),
  ),

  hollow: svg(
    R(0, 0, W, H, "#000008") +
      R(20, 12, 32, 16, "#0a1028") +
      stars(2, 80, 2, 38, "#5060a0") +
      R(34, 18, 4, 6, "#203060"),
  ),

  aurel: svg(
    R(0, 0, W, H, "#080014") +
      R(0, 26, W, 14, "#180830") +
      R(0, 10, W, 16, "#301868") +
      R(28, 6, 16, 30, "#6040a0") +
      R(30, 8, 12, 24, "#8060d0") +
      R(32, 10, 8, 8, "#fff0ff") +
      R(26, 2, 20, 6, "#ffd700") +
      stars(13, 50, 2, 12, "#e0c0ff"),
  ),

  eclipse_finale: svg(
    R(0, 0, W, H, "#020008") +
      R(0, 20, W, 20, "#201050") +
      R(0, 0, W, 22, "#080018") +
      R(26, 8, 20, 12, "#ffc060") +
      R(30, 10, 12, 8, "#ffe0a0") +
      R(32, 11, 8, 6, "#000008") +
      R(10, 4, 6, 1, "#ffd878") +
      R(56, 6, 8, 1, "#ffd878") +
      stars(21, 45, 2, 18, "#8060a8"),
  ),

  aftermath: svg(
    R(0, 0, W, H, "#1a1028") +
      R(0, 26, W, 14, "#120818") +
      R(4, 22, 16, 8, "#302040") +
      R(24, 24, 20, 6, "#281838") +
      R(50, 20, 14, 10, "#382848") +
      R(10, 18, 8, 4, "#604878") +
      R(30, 10, 40, 2, "#504060") +
      stars(55, 20, 4, 14, "#604070"),
  ),

  dawnroad: svg(
    R(0, 0, W, 20, "#ffb898") +
      R(0, 20, W, 20, "#706090") +
      R(0, 18, W, 6, "#ffd8b0") +
      R(32, 8, 8, 8, "#ffe090") +
      R(20, 22, 32, 18, "#504868") +
      R(34, 24, 4, 14, "#403058") +
      R(30, 20, 12, 2, "#8888a8"),
  ),

  starfield_path: svg(
    R(0, 0, W, H, "#06051a") +
      stars(101, 160, 2, 38, "#ffffff") +
      R(28, 12, 16, 28, "#101838") +
      R(30, 14, 12, 24, "#182848") +
      R(32, 32, 8, 2, "#6090c0") +
      stars(202, 60, 8, 30, "#a0b8ff"),
  ),

  horizon_clear: svg(
    R(0, 0, W, 16, "#87b8ff") +
      R(0, 16, W, 12, "#c8e090") +
      R(0, 28, W, 12, "#609078") +
      R(0, 26, W, 4, "#b8d8a0") +
      R(16, 30, 40, 10, "#786868") +
      R(28, 24, 16, 4, "#908080") +
      stars(19, 8, 4, 10, "#ffffff"),
  ),

  resolution_end: svg(
    R(0, 0, W, 14, "#2a2050") +
      R(0, 14, W, 12, "#ffd8c0") +
      R(0, 26, W, 14, "#1a1530") +
      stars(33, 35, 3, 12, "#fff8e0") +
      R(20, 30, 32, 4, "#4a6090") +
      R(30, 18, 12, 10, "#ffe898"),
  ),
};

function encode(s) {
  return encodeURIComponent(s)
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

let css = `/* Auto-generated by tools/gen-story-pixel-css.mjs — do not edit by hand */
.scene-backdrop.scene-backdrop--pixel {
  background-blend-mode: normal;
  box-shadow:
    0 10px 0 var(--story-shadow),
    inset 0 0 0 2px rgb(18 12 28 / 0.35);
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
}

.scene-backdrop.scene-backdrop--pixel::after {
  background-image: linear-gradient(transparent 55%, rgb(0 0 0 / 0.22) 100%);
  opacity: 1;
}

`;

for (const [name, svgStr] of Object.entries(scenes)) {
  const u = `url("data:image/svg+xml;charset=utf-8,${encode(svgStr)}")`;
  css += `.scene-backdrop.scene-backdrop--pixel[data-scene="${name}"] {
  background-color: #120818;
  background-image: ${u};
  background-size: cover;
  background-position: center;
}

`;
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "css");
mkdirSync(outDir, { recursive: true });
const out = join(outDir, "story-pixel-scenes.css");
writeFileSync(out, css, "utf8");
console.error("Wrote", out);
