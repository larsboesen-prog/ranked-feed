// /page2's cards in a new random order each visit (owner, 19 Nov 2026): each kind's places shuffled; sights keep their order;
// closing a card with Back or using a filter is the same visit, so the order holds. Runs the real page (../page2) on a
// small made-up city (fixtures/) in Chromium. node --test "mapsma/test/*.test.mjs"   (needs Playwright, as tiny-speech's browser tests do)
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
const FILES = { "/page2/": HERE + "../page2/index.html", "/data.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js",
  "/icons.js": HERE + "fixtures/icons.js", "/photos/selected.json": HERE + "fixtures/photos/selected.json", "/photos/hours.json": HERE + "fixtures/photos/hours.json" };
let server, port, browser;
before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
    const path = new URL(req.url, "http://x").pathname;
    if (path === "/other.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end("<!doctype html><title>other</title>"); }
    const file = FILES[path];
    if (!file) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": file.endsWith(".html") ? "text/html; charset=utf-8" : file.endsWith(".json") ? "application/json" : "text/javascript" });
    res.end(await readFile(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); server?.close(); });

test("each visit, each kind's places come in a new random order, held for the whole visit; sights keep theirs", { skip }, async () => {
  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const order = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll("#grid .grp")].map((g) => [g.textContent.trim(), [...g.nextElementSibling.querySelectorAll(".pc")].map((x) => x.dataset.id)])));
  const ready = () => page.waitForFunction(() => document.querySelectorAll("#grid .pc").length === 7);
  await page.goto(`http://localhost:${port}/page2/`); await ready();
  const first = await order();
  assert.deepEqual([...first["Coffee & bakery"]].sort(), ["1", "2", "3"], "every place, once");
  assert.deepEqual(first.Sights, ["S1", "S2"], "sights keep their order");

  // the same visit: closing a card with Back, a filter on and off
  await page.click('#grid .pc[data-id="1"]'); await page.waitForTimeout(200); await page.goBack(); await page.waitForTimeout(200);
  await page.click('.chip[data-k="mex"]'); await page.waitForTimeout(100);
  assert.deepEqual((await order()).Mexican, first.Mexican, "a filter keeps the visit's order");
  await page.click(".chip.all"); await page.waitForTimeout(100);
  assert.deepEqual(await order(), first, "the whole visit keeps one order");

  // new visits: every place reaches the top of its kind sooner or later; no visit order is fixed
  const tops = new Set([first["Coffee & bakery"][0]]), orders = new Set([first["Coffee & bakery"].join()]);
  for (let k = 0; k < 24; k++) {
    if (k % 2) { await page.reload(); } else { await page.goto(`http://localhost:${port}/other.html`); await page.goBack(); }
    await ready(); await page.waitForTimeout(100);
    const o = await order();
    tops.add(o["Coffee & bakery"][0]); orders.add(o["Coffee & bakery"].join());
    assert.deepEqual(o.Sights, ["S1", "S2"]);
  }
  assert.deepEqual([...tops].sort(), ["1", "2", "3"], "each café had its turn at the top (25 visits; by chance alone this fails about once in 8,000 runs)");
  assert.ok(orders.size >= 3, "different orders on different visits");
  assert.deepEqual(errors, []);
});

test("without storage (a private window that refuses it) the page still works", { skip }, async () => {  const context = await browser.newContext();
  await context.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }); });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${port}/page2/`);
  await page.waitForFunction(() => document.querySelectorAll("#grid .pc").length === 7);
  assert.deepEqual(errors, []);
});
