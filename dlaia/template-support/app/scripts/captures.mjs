#!/usr/bin/env node
// Capture chaque slide de dist/index.html en PNG 1920×1080 dans tmp/captures/ et signale
// les slides dont le contenu déborde du canevas, avec la mesure de SlideView.tsx en mode dev
// (scrollHeight > clientHeight + 1). Les pages de TP sont capturées en demi-écran (960 px).
//
// Usage : npm run captures [-- --module NN] [-- --html chemin/vers/index.html]
// Sortie : un fichier NN-SSS-titre.png par slide, NN-tp-NN.png par TP ; code 1 si une slide déborde.
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../.."); // dlaia/
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const moduleFilter = opt("--module");
const html = resolve(root, opt("--html") ?? "dist/index.html");
const outDir = resolve(root, "tmp/captures");

if (!existsSync(html)) {
  console.error(`${html} absent : lancer npm run build`);
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) {
  if (!moduleFilter || f.startsWith(`${moduleFilter}-`)) rmSync(resolve(outDir, f));
}

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
const modulePrefix = (origin) => /^(\d\d)-/.exec(origin)?.[1] ?? "carte";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`${pathToFileURL(html).href}#1`, { waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(window.__deck));
await page.evaluate(() => document.fonts.ready);

// Agrandit la fenêtre pour que le canevas 1920×1080 soit rendu à l'échelle 1.
const frame = await page.evaluate(() => {
  const el = document.querySelector(".slide-content").parentElement.parentElement;
  return { dw: window.innerWidth - el.clientWidth, dh: window.innerHeight - el.clientHeight };
});
await page.setViewportSize({ width: 1920 + frame.dw, height: 1080 + frame.dh });

const deck = await page.evaluate(() => ({
  slides: window.__deck.slides.map((s) => ({ title: s.title, origin: s.origin, kind: s.kind })),
  tps: window.__deck.tps.map((t) => ({ id: t.id, title: t.title, slideIndex: t.slideIndex })),
}));

const goto = async (hash, ready) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await page.waitForFunction(ready, undefined, { timeout: 10_000 });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
};

const overflows = [];
let captured = 0;

for (const [k, s] of deck.slides.entries()) {
  const prefix = modulePrefix(s.origin);
  if (moduleFilter && prefix !== moduleFilter) continue;
  const n = k + 1;
  await goto(`#${n}`, `document.title.startsWith("${n}/")`);
  const over = await page.evaluate(() => {
    const body = [...document.querySelector(".slide-content").children].find((c) => c.classList.contains("overflow-hidden"));
    return body ? { dx: body.scrollWidth - body.clientWidth - 1, dy: body.scrollHeight - body.clientHeight - 1 } : null;
  });
  const file = `${prefix}-${String(n).padStart(3, "0")}-${slug(s.title || s.kind)}.png`;
  await page.locator(".slide-content").screenshot({ path: resolve(outDir, file) });
  captured++;
  if (over && (over.dx > 0 || over.dy > 0)) overflows.push(`${s.origin} « ${s.title} » : déborde de ${Math.max(over.dx, over.dy)} px (${file})`);
}

for (const tp of deck.tps) {
  const prefix = modulePrefix(deck.slides[tp.slideIndex].origin);
  if (moduleFilter && prefix !== moduleFilter) continue;
  await page.setViewportSize({ width: 960, height: 1080 });
  await goto(`#${tp.id}`, `document.title === ${JSON.stringify(tp.title)}`);
  const height = await page.evaluate(() => {
    const scroller = document.querySelector(".flex-1.overflow-auto");
    return scroller ? scroller.scrollHeight + (window.innerHeight - scroller.clientHeight) : window.innerHeight;
  });
  await page.setViewportSize({ width: 960, height: Math.min(height, 16_000) });
  await page.screenshot({ path: resolve(outDir, `${prefix}-${tp.id}.png`) });
  captured++;
  await page.setViewportSize({ width: 1920 + frame.dw, height: 1080 + frame.dh });
}

await browser.close();

console.log(`${captured} captures dans ${outDir}`);
if (overflows.length) {
  console.log(`${overflows.length} slide(s) en débordement :`);
  for (const o of overflows) console.log(`  ${o}`);
  process.exit(1);
}
