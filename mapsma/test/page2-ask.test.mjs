// The voice page as the third view (owner, 22 Nov 2026: "Add ask icon (the page 5 voice feature) to the main photo/map menu on page
// 2"): /page2's and /page3's menu is Photos | Map | Ask (Fotos | Mapa | Voz), as /page5's own. On a phone (the site hides the menu's
// icons below 421 px) Ask is its microphone alone, named for screen readers; the menu still fits a 360 px screen with the site's
// 16 px margin. Runs the real /page2 on the small made-up city (fixtures/) in Chromium; /page3 is checked as text (it needs the map).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require("playwright")); } catch { try { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); } catch { /* skipped */ } }
const skip = chromium ? false : "Playwright is not installed";
const HERE = fileURLToPath(new URL(".", import.meta.url));
const FILES = { "/page2/": HERE + "../page2/index.html", "/places.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js",
  "/icons.js": HERE + "fixtures/icons.js", "/photos/selected.json": HERE + "fixtures/photos/selected.json" };
let server, port, browser;
before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
    const path = new URL(req.url, "http://x").pathname;
    const file = FILES[path];
    if (!file) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": path.endsWith("/") ? "text/html; charset=utf-8" : path.endsWith(".json") ? "application/json" : "text/javascript" });
    res.end(await readFile(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); server?.close(); });

async function menu(width, lang) {
  const ctx = await browser.newContext({ viewport: { width, height: 400 } });
  await ctx.addInitScript((l) => { try { localStorage.setItem("sma-lang", l); } catch { /* none */ } }, lang);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${port}/page2/`);
  await page.waitForSelector("nav.views .ask-v");
  const m = await page.$eval("nav.views", (n) => {
    const a = n.querySelector(".ask-v"), shown = (el) => !!el && getComputedStyle(el).display !== "none";
    return { items: [...n.children].map((c) => c.tagName + ":" + (c.querySelector("b")?.textContent || "")), href: a.getAttribute("href"), aria: a.getAttribute("aria-label"),
      micShown: shown(a.querySelector("i")) && !!a.querySelector("svg"), labelShown: shown(a.querySelector("b")), right: n.getBoundingClientRect().right };
  });
  await ctx.close();
  return { ...m, errors };
}

test("/page2's menu: Photos | Map | Ask, Ask opening the voice page; Fotos | Mapa | Voz in Spanish", { skip }, async () => {
  const en = await menu(800, "en");
  assert.deepEqual(en.items.map((x) => x.split(":")[0]), ["SPAN", "A", "A"], "Photos is the current view, Map and Ask are links");
  assert.equal(en.items[2], "A:Ask");
  assert.equal(en.href, "/page5/");
  assert.ok(en.micShown && en.labelShown, "the microphone and the word on a wide screen");
  assert.deepEqual(en.errors, []);
  const es = await menu(800, "es");
  assert.equal(es.items[2], "A:Voz");
  assert.equal(es.aria, "Pregunta con tu voz");
  assert.deepEqual(es.errors, []);
});

test("on a phone, Ask is its microphone, and the menu fits a 360 px screen", { skip }, async () => {
  for (const lang of ["en", "es"]) {
    const m = await menu(360, lang);
    assert.ok(m.micShown, "the microphone shows on a phone");
    assert.equal(m.labelShown, false, "the word is left out, to fit");
    assert.ok(m.aria, "named for screen readers");
    assert.ok(m.right <= 360 - 12, `the menu ends at ${m.right} px`);
    assert.deepEqual(m.errors, []);
  }
});

test("/page3 (the map): the same Ask in its menu, and nothing else changed from the live page", () => {
  const live = readFileSync(HERE + "../page3/live-2026-11-21.html", "utf8"), ours = readFileSync(HERE + "../page3/index.html", "utf8");
  assert.match(ours, /<nav class="views" aria-label="View"><a href="\/page2\/">.*<span><i>🗺 <\/i><b data-t>Map<\/b><\/span><a href="\/page5\/" class="ask-v"/);
  const strip = (s) => s.replace(/<a href="\/page5\/" class="ask-v"[^]*?<\/a>/, "").replace(/\n@media \(max-width:420px\)\{ \.views \.ask-v[^\n]*\n@media \(max-width:400px\)[^\n]*/, "")
    .replace(/\/\/ the voice page \(\/page5\), the third view[^\n]*\n[^\n]*\n\{ const al = [^\n]*\n/, "");
  assert.equal(strip(ours), live, "only the Ask link, its two style lines and its label code were added");
});
