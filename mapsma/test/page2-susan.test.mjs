// /page2's "Susan York's latest reviews" (owner, 20 Nov 2026): of the ten places she reviewed most recently (/page5/susan.js,
// window.SUSAN.latest), the ones open now or opening within two hours, in San Miguel time; all ten on request. Runs the real
// page (../page2) on the small made-up city (fixtures/) in Chromium with the clock set. node --test "mapsma/test/*.test.mjs"
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
const FILES = { "/page2/": HERE + "../page2/index.html", "/places.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js",
  "/icons.js": HERE + "fixtures/icons.js", "/photos/selected.json": HERE + "fixtures/photos/selected.json" };
// Days: "0" is Monday, as on the site. 20 Nov 2026 is a Friday ("4").
const day = (d, h) => Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((k) => [String(k), d.includes(k) ? h : null]));
const HOURS = { places: {
  "4": { hours: day([0, 1, 2, 3, 4, 5, 6], "12:00–20:00"), checked: "2026-11-05" },
  "5": { hours: day([4], "19:30–23:00"), checked: "2026-11-05" },
  "9": { hours: day([4], "17:00–19:00"), checked: "2026-11-05" },
  "1": { hours: day([4], "8:00–22:00"), checked: "2026-11-05", status: "CLOSED_TEMPORARILY" } } };
const post = "https://blog.example/post.html";
const SUSAN = `window.SUSAN={blog:"https://blog.example",checked:"2026-11-20",picks:[],latest:[
 {id:"4",name:"Tacos Cuatro",date:"2026-09-25",url:"${post}",note:"Tacos",note_es:"Tacos (es)"},
 {id:"5",name:"Fonda Cinco",date:"2026-09-25",url:"${post}",note:"Fonda",note_es:"Fonda (es)"},
 {name:"Off Site Late",area:"Calle Lejos 1",date:"2026-09-25",url:"${post}",note:"Late",note_es:"Tarde",hours:${JSON.stringify(day([4], "21:00–23:00"))},hours_from:"${post}"},
 {name:"No Hours",date:"2026-09-25",url:"${post}",note:"Unknown",note_es:"Sin horario"},
 {id:"9",name:"Extra Nueve",date:"2026-09-25",url:"${post}",note:"Not on page 2",note_es:"No está en la página 2"},
 {name:"Past Midnight",date:"2026-08-23",url:"${post}",note:"Night owl",note_es:"Nocturno",hours:${JSON.stringify(day([4], "20:00–2:00"))},hours_from:"${post}"},
 {id:"1",name:"Café Uno",date:"2026-08-23",url:"${post}",note:"Closed for now",note_es:"Cerrado por ahora"},
 {name:"After Midnight",date:"2026-08-23",url:"${post}",note:"Opens late",note_es:"Abre tarde",hours:${JSON.stringify(day([5], "0:30–3:00"))},hours_from:"${post}"}
]};`;
let server, port, browser;
before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
    const path = new URL(req.url, "http://x").pathname;
    const send = (type, body) => { res.writeHead(200, { "content-type": type }); res.end(body); };
    if (path === "/page5/susan.js") return send("text/javascript", SUSAN);
    if (path === "/photos/hours.json") return send("application/json", JSON.stringify(HOURS));
    const file = FILES[path];
    if (!file) { res.writeHead(404); return res.end(); }
    send(file.endsWith(".html") ? "text/html; charset=utf-8" : file.endsWith(".json") ? "application/json" : "text/javascript", await readFile(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); server?.close(); });

async function at(iso, lang = "en") {
  const context = await browser.newContext();
  await context.addInitScript((l) => { try { localStorage.setItem("sma-lang", l); } catch { /* none */ } }, lang);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.clock.setFixedTime(new Date(iso));
  await page.goto(`http://localhost:${port}/page2/`);
  await page.waitForFunction(() => document.querySelectorAll("#grid .pc").length === 7);
  await page.waitForLoadState("networkidle"); await page.waitForTimeout(200);  // hours.json read
  const cards = () => page.$$eval("#susan .sy-card", (cs) => cs.map((c) => ({ name: c.querySelector("b").textContent, status: c.querySelector(".sy-s").textContent,
    open: !!c.querySelector(".sy-open"), directions: !!c.querySelector(".sy-m a + a"), note: c.querySelector(".sy-n").textContent })));
  return { page, errors, cards };
}

test("Friday 18:30 in San Miguel: open now first, then what opens within two hours; closed, unknown and later ones wait for All 10", { skip }, async () => {
  const { page, errors, cards } = await at("2026-11-21T00:30:00Z");  // Fri 20 Nov 18:30 in Mexico City (UTC-6)
  const c = await cards();
  assert.deepEqual(c.map((x) => x.name), ["Tacos Cuatro", "Extra Nueve", "Fonda Cinco", "Past Midnight"], "Off Site Late opens in 2.5 h");
  assert.match(c[0].status, /Open now · until 20:00/);
  assert.match(c[2].status, /Opens at 19:30 · in 1 h/);
  assert.equal(c[0].open, true, "a place on page 2 opens its own card");
  assert.equal(c[1].open, false, "a place that is not on page 2 (the extra places) gets directions instead");
  assert.equal(c[1].directions, true);

  await page.click("#susan .sy-open");
  await page.waitForSelector("#detail.show");
  assert.equal(await page.textContent("#card .c-name"), "Tacos Cuatro");
  await page.goBack(); await page.waitForTimeout(200);

  await page.click("#susan .sy-all");
  const all = await cards();
  assert.equal(all.length, 8, "All 10 shows every review, newest first");
  assert.deepEqual(all.map((x) => x.name).slice(0, 2), ["Tacos Cuatro", "Fonda Cinco"]);
  assert.match(all.find((x) => x.name === "No Hours").status, /Hours not on our site/);
  assert.match(all.find((x) => x.name === "Café Uno").status, /Temporarily closed/);
  assert.match(all.find((x) => x.name === "Off Site Late").status, /Opens at 21:00/);
  assert.match(all.find((x) => x.name === "Off Site Late").status, /worth confirming/, "hours from her post are marked");

  await page.fill("#q", "uno"); await page.waitForTimeout(100);
  assert.equal(await page.$eval("#susan", (e) => e.innerHTML), "", "a search hides the section");
  assert.deepEqual(errors, []);
});

test("after midnight: last night's late hours count as open; an opening just after midnight counts as soon", { skip }, async () => {
  let r = await at("2026-11-21T07:00:00Z");  // Sat 21 Nov 01:00
  assert.deepEqual((await r.cards()).map((x) => x.name), ["Past Midnight", "After Midnight"]);
  r = await at("2026-11-21T05:30:00Z");  // Fri 23:30
  const c = await r.cards();
  assert.ok(c.some((x) => x.name === "After Midnight" && /Opens at 0:30 · in 1 h/.test(x.status)), JSON.stringify(c));
  assert.deepEqual(r.errors, []);
});

test("in Spanish, and with nothing open soon it says so", { skip }, async () => {
  const { page, errors, cards } = await at("2026-11-17T10:00:00Z", "es");  // Tue 04:00
  assert.deepEqual(await cards(), []);
  assert.match(await page.textContent("#susan"), /Las reseñas más recientes de Susan York/);
  assert.match(await page.textContent("#susan .sy-none"), /Ninguna de sus diez/);
  await page.click("#susan .sy-all");
  assert.equal((await cards())[0].note, "Tacos (es)");
  assert.deepEqual(errors, []);
});

test("without susan.js the page works as before", { skip }, async () => {
  const context = await browser.newContext();
  await context.route("**/page5/susan.js*", (route) => route.fulfill({ status: 404, body: "" }));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${port}/page2/`);
  await page.waitForFunction(() => document.querySelectorAll("#grid .pc").length === 7);
  assert.equal(await page.$eval("#susan", (e) => e.innerHTML), "");
  assert.deepEqual(errors, []);
});
