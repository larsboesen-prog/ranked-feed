// /page5 (owner, 20 Nov 2026: "Listings 'not our pick' lack details. Fix. Remove not our pick and instead mark our selection
// 'our pick'"): the extra places carry no label and get a description (/descs.js); our picks are marked "★ Our pick" on their
// cards and detail cards, and in the written answer when extra places are listed too. Runs the real page (../page5, the site's
// other page-5 modules from ../page5/live-2026-11-20) on the small made-up city (fixtures/) in Chromium, asking by typing.
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
  "/page5/susan.js": P5 + "susan.js", "/page5/read.js": P5 + "read.js", "/page5/listen.js": LIVE + "listen.js", "/page5/spanish.js": LIVE + "spanish.js",
  "/places.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js", "/icons.js": HERE + "fixtures/icons.js",
  "/photos/selected.json": HERE + "fixtures/photos/selected.json", "/photos/hours.json": HERE + "fixtures/photos/hours.json" };
const INLINE = { "/page5/facts.js": "window.FACTS={\"9\":{\"w\":\"tacos al pastor\",\"w_es\":\"tacos al pastor\"}};",
  "/descs.js": "window.DESCS={\"9\":[\"Late-night taco stand for al pastor.\",\"Puesto nocturno de tacos al pastor.\"]};" };
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
  await page.waitForSelector(".turn .cards .pc", { timeout: 5000 }).catch(async () => { throw new Error("no cards: " + (await page.textContent(".turn"))); });
  return { page, errors };
}

test("a list with our picks and an extra place: ours are marked, the extra is not, and nothing says 'not our pick'", { skip }, async () => {
  const { page, errors } = await asked("Mexican food");
  const cards = await page.$$eval(".turn .cards .pc", (cs) => cs.map((c) => ({ id: c.dataset.id, tag: c.querySelector(".tag")?.textContent || "" })));
  assert.deepEqual(cards.map((c) => c.id).sort(), ["4", "5", "9"]);
  for (const c of cards) assert.equal(c.tag, c.id === "9" ? "" : "★ Our pick", JSON.stringify(c));
  const text = await page.textContent(".turn");
  assert.doesNotMatch(text, /not (one of )?our pick/i);
  const lines = await page.$$eval(".turn .chat li", (ls) => ls.map((l) => l.textContent));
  if (lines.length) {  // the written answer (Quiet's chat): ours marked, the extra not
    assert.ok(lines.filter((l) => l.includes("★ our pick")).length === 2, JSON.stringify(lines));
  }

  await page.click('.turn .cards .pc[data-id="9"]');
  await page.waitForTimeout(300);
  const extra = await page.evaluate(() => document.body.innerText);
  assert.match(extra, /Late-night taco stand for al pastor\./, "the extra place's description");
  assert.doesNotMatch(extra, /Not one of our picks/);
  assert.deepEqual(errors, []);
});

test("a pick's detail card says it is our pick; in Spanish too", { skip }, async () => {
  let { page, errors } = await asked("Mexican food");
  await page.click('.turn .cards .pc[data-id="4"]');
  await page.waitForTimeout(300);
  assert.match(await page.evaluate(() => document.body.innerText), /★ Our pick: chosen by people who live here/);
  assert.deepEqual(errors, []);
  ({ page, errors } = await asked("comida mexicana", "es"));
  const tags = await page.$$eval(".turn .cards .pc .tag", (ts) => ts.map((t) => t.textContent));
  assert.deepEqual(tags, ["★ Recomendado", "★ Recomendado"]);
  assert.doesNotMatch(await page.textContent(".turn"), /no es de nuestra lista/i);
  await page.click('.turn .cards .pc[data-id="9"]');
  await page.waitForTimeout(300);
  assert.match(await page.evaluate(() => document.body.innerText), /Puesto nocturno de tacos al pastor\./);
  assert.deepEqual(errors, []);
});
