// /page5's live music venues (owner, 21 Nov 2026: asked "Where is Johnny's piano bar" and got four other bars: the venues were in
// tiny-speech's pack, not in the site's data): /page5/venues.js adds Mama Mía, Raindog Cantina, Johnny's Piano Bar and Casa Europa
// as extra places, unless the site's data already has a place of that name. The real page on the small made-up city, asking by typing.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require("playwright")); } catch { try { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); } catch { /* skipped */ } }
const skip = chromium ? false : "Playwright is not installed";
const HERE = fileURLToPath(new URL(".", import.meta.url));
const P5 = HERE + "../page5/", LIVE = P5 + "live-2026-11-20/";
const FILES = { "/page5/": P5 + "index.html", "/page5/ask.js": P5 + "ask.js", "/page5/words.js": P5 + "words.js", "/page5/rules.js": P5 + "rules.js",
  "/page5/susan.js": P5 + "susan.js", "/page5/read.js": LIVE + "read.js", "/page5/listen.js": LIVE + "listen.js", "/page5/spanish.js": LIVE + "spanish.js",
  "/places.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js", "/icons.js": HERE + "fixtures/icons.js",
  "/photos/selected.json": HERE + "fixtures/photos/selected.json", "/photos/hours.json": HERE + "fixtures/photos/hours.json",
  "/page5/venues.js": P5 + "venues.js" };
const INLINE = { "/page5/facts.js": "window.FACTS={};", "/descs.js": "window.DESCS={};" };
let server, port, browser;
before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
    const path = new URL(req.url, "http://x").pathname;
    const type = path.endsWith("/") ? "text/html; charset=utf-8" : path.endsWith(".json") ? "application/json" : "text/javascript";
    if (INLINE[path]) { res.writeHead(200, { "content-type": type }); return res.end(INLINE[path]); }
    const file = FILES[path];
    if (!file) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": type });
    res.end(await readFile(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); server?.close(); });

async function asked(question, lang = "en") {
  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${port}/page5/`);
  await page.click(`.sp-lang[data-lang="${lang}"]`);
  await page.waitForFunction(() => !document.querySelector(".splash:not([hidden])") || getComputedStyle(document.querySelector(".splash")).display === "none", null, { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState("load");
  await page.waitForFunction((l) => window.LANG === l && window.PLACES && document.getElementById("askForm"), lang);
  await page.waitForTimeout(300);
  await page.evaluate((t) => { document.getElementById("q").value = t; document.getElementById("askForm").requestSubmit(); }, question);  // the typing row is hidden until opened
  await page.waitForSelector(".turn", { timeout: 10000 });
  return { page, errors, answer: () => page.textContent(".turn .a"), one: () => page.textContent(".turn .one").catch(() => "") };
}

test("Where is Johnny's piano bar: the venue itself, a piano bar, with its hours", { skip }, async () => {
  const { errors, answer, one } = await asked("where is johnny's piano bar");
  assert.match(await answer(), /Johnny's Piano Bar/);
  assert.match(await answer(), /\b(18|22|23):00\b/, "one of its hours, from the pack (opens 18:00, closes 22:00 or 23:00: which one depends on the clock)");
  const card = await one();
  assert.match(card, /Johnny's Piano Bar/);
  assert.match(card, /Piano bar/i, "what it is, from the venue's facts");
  assert.match(card, /Mesones 101/, "its address");
  assert.doesNotMatch(card, /★ Our pick/, "an extra place, not one of our picks");
  assert.deepEqual(errors, []);
});

test("Raindog Cantina and Mama Mía are found by name, in Spanish too", { skip }, async () => {
  let { errors, answer, one } = await asked("is raindog cantina open");
  assert.match(await answer(), /Raindog Cantina/);
  assert.match(await one(), /Zacateros 45/);
  assert.deepEqual(errors, []);
  ({ errors, answer, one } = await asked("dónde está mama mía", "es"));
  assert.match(await answer(), /Mama Mía/);
  assert.match(await one(), /Umarán 8/);
  assert.deepEqual(errors, []);
});

test("a venue already in the site's data is not added twice", { skip }, async () => {
  const page = await (await browser.newContext()).newPage();
  await page.addInitScript(() => {  // the site's data with Johnny's in it, as once rebuild.py carries it
    let real;
    Object.defineProperty(window, "PLACES", { configurable: true, get: () => real,
      set: (v) => { real = v; if (Array.isArray(v) && !v.some((p) => p.name === "Johnny's Piano Bar")) v.push({ id: "77", name: "Johnny's Piano Bar", cat: "share", lat: 20.9156, lng: -100.7452, area: "Centro", desc: "" }); } });
  });
  await page.goto(`http://localhost:${port}/page5/`);
  await page.waitForFunction(() => window.PLACES && document.getElementById("askForm"));
  const found = await page.evaluate(() => window.PLACES.filter((p) => /johnny/i.test(p.name)).map((p) => p.id));
  assert.deepEqual(found, ["77"]);
  assert.ok(await page.evaluate(() => window.PLACES.some((p) => p.name === "Raindog Cantina")), "the others still added");
});
