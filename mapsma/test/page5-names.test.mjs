// /page5 finds place names by sound (owner, 22 Nov 2026: "it still fails on place names said with an accent. 'Estoril'
// is not recognised at all… 1. Match place names by sound… 2. Ask when unsure… One tap picks the place."). A Danish voice (Piper
// da_DK talesyntese, CC0 data) asks through the fake microphone; the ears' words miss the name; the sounds find it. The clips start
// with a second of silence: the fake microphone plays from the moment it opens, before the page records (a person starts after the tap).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join, normalize } from "node:path";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require("playwright")); } catch { try { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); } catch { /* skipped */ } }
const HERE = fileURLToPath(new URL(".", import.meta.url));
const TS = fileURLToPath(new URL("../../tiny-speech/", import.meta.url));
const EARS = "engines/ears/ears-int8-2026-11-22.onnx";
const skip = !chromium ? "Playwright is not installed" : !existsSync(TS + EARS) ? "the ears model is not here" : false;
const P5 = HERE + "../page5/", LIVE = P5 + "live-2026-11-20/";
const FILES = { "/page5/": P5 + "index.html", "/page5/ask.js": P5 + "ask.js", "/page5/words.js": P5 + "words.js", "/page5/rules.js": P5 + "rules.js",
  "/page5/susan.js": P5 + "susan.js", "/page5/read.js": LIVE + "read.js", "/page5/listen.js": LIVE + "listen.js", "/page5/spanish.js": LIVE + "spanish.js",
  "/page5/pcm-worklet.js": TS + "browser/pcm-worklet.js",
  "/places.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js", "/icons.js": HERE + "fixtures/icons.js",
  "/photos/selected.json": HERE + "fixtures/photos/selected.json", "/photos/hours.json": HERE + "fixtures/photos/hours.json" };
// The made-up test city has none of San Miguel's names: three of them come in as extra places, with the real venues (same ids as the pack)
const real = readFileSync(P5 + "venues.js", "utf8"), V = JSON.parse(real.slice(real.indexOf("{"), real.lastIndexOf("}") + 1));
const extra = [["67", "Estoril", "mex"], ["51", "Casa Nostra", "mex"], ["46", "San Mezcal", "mex"]].map(([id, name, cat]) => ({ id, name, cat, lat: 20.914, lng: -100.745, area: "Centro", desc: "", acc: "street", other: true }));
const INLINE = { "/page5/facts.js": "window.FACTS={};", "/descs.js": "window.DESCS={};", "/page5/venues.js": `window.VENUES=${JSON.stringify({ ...V, places: [...V.places, ...extra] })};` };
const TYPE = (p) => (p.endsWith("/") || p.endsWith(".html") ? "text/html; charset=utf-8" : p.endsWith(".json") ? "application/json" : /\.(gguf|onnx)$/.test(p) ? "application/octet-stream" : "text/javascript");
let server, port;
const browsers = [];
before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (INLINE[path]) { res.writeHead(200, { "content-type": TYPE(path) }); return res.end(INLINE[path]); }
    let file = FILES[path];
    if (!file && path.startsWith("/tiny-speech/")) {  // the shared core as on the site: the repository's folders, packs/dist/ as packs/
      const rest = path.slice("/tiny-speech/".length).replace(/^packs\//, "packs/dist/");
      file = normalize(join(TS, rest));
      if (!file.startsWith(TS)) file = null;
    }
    if (!file || !existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPE(file) });
    res.end(await readFile(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
});
after(async () => { for (const b of browsers) await b.close().catch(() => {}); server?.close(); });

// The English page, the fake microphone playing one clip; returns once the answer to the spoken question is on the page.
// profile: a folder to keep the browser's storage in (a returning visitor), else a fresh browser.
async function askAloud(wav, profile = null) {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const opts = { ...(proxy ? { proxy: { server: proxy, bypass: "localhost,127.0.0.1" } } : {}),
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${TS}test/fixtures/ears/${wav}%noloop`] };
  let browser, context;
  if (profile) { context = await chromium.launchPersistentContext(profile, { ...opts, permissions: ["microphone"] }); browser = context; }
  else { browser = await chromium.launch(opts); context = await browser.newContext({ permissions: ["microphone"] }); }
  browsers.push(browser);
  await context.addInitScript(() => {
    try { if (!sessionStorage.getItem("t-set")) { sessionStorage.setItem("t-set", "1"); localStorage.setItem("sma-lang", "en"); localStorage.setItem("sma-ask:voice", "off"); } } catch { /* none */ }
    window.__heard = [];
    const Real = window.Worker;
    window.Worker = class extends Real {
      constructor(url, opts) { super(url, opts); if (/asr-worker/.test(String(url))) this.addEventListener("message", ({ data }) => { if (data.type === "text" || data.type === "ready" || data.type === "error") window.__heard.push(data); }); }
    };
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${port}/page5/`);
  await page.click('.sp-lang[data-lang="en"]');
  await page.waitForFunction(() => window.__heard.some((m) => m.type === "ready" || m.type === "error"), null, { timeout: 120000 })
    .catch((e) => { throw new Error(`no ready: ${e.message}; page errors ${JSON.stringify(errors)}`); });
  await page.click("#mic");
  await page.waitForFunction(() => window.__heard.some((m) => m.type === "text"), null, { timeout: 60000 });
  await page.waitForSelector("#convo .turn", { timeout: 15000 });
  const heard = await page.evaluate(() => window.__heard.find((m) => m.type === "text"));
  return { browser, page, errors, heard };
}

test("a Danish voice's 'Is Estoril open?', the name written wrong: the page answers about Estoril, or offers it first (one tap)", { skip, timeout: 240000 }, async () => {
  const { browser, page, errors, heard } = await askAloud("acc-67-0-da_DK-talesyntese-medium.wav");
  console.log(JSON.stringify({ text: heard.text, spot: (heard.spot || []).slice(0, 2) }));
  assert.doesNotMatch(heard.text, /estoril/, "the words miss the name");
  assert.equal(heard.spot[0].name, "Estoril");
  let turn = page.locator("#convo .turn").first();
  assert.equal(await turn.locator(".q").textContent(), heard.text, "what was heard is shown as heard");
  // through Chromium's fake microphone Estoril costs 2.1-2.8 per sound from run to run (the machine's load): at most 2.5 answers,
  // above it the page asks, Estoril the first (and here only) button
  if (heard.spot[0].perSound <= 2.5) {
    assert.equal(await turn.locator(".bysound").textContent(), "Heard as Estoril");
    assert.equal(await turn.locator(".nearrow").count(), 0);
  } else {
    assert.match(await turn.locator(".a").textContent(), /Did you mean/);
    assert.equal(await turn.locator(".nearrow button").first().textContent(), "Estoril");
    await turn.locator(".nearrow button").first().click();
    await page.waitForFunction(() => document.querySelectorAll("#convo .turn").length === 2);
    turn = page.locator("#convo .turn").first();
  }
  assert.match(await turn.locator(".one").textContent(), /Estoril/, "the answer is Estoril's card");
  assert.match(await turn.locator(".a").textContent(), /Estoril/);
  assert.deepEqual(errors, []);
  await browser.close();
});

test("a Danish voice's 'Is Casa Nostra open?', the name written wrong: two close names offered; one tap answers", { skip, timeout: 240000 }, async () => {
  const { browser, page, errors, heard } = await askAloud("acc-51-0-da_DK-talesyntese-medium.wav");
  console.log(JSON.stringify({ text: heard.text, spot: (heard.spot || []).slice(0, 3) }));
  const turn = page.locator("#convo .turn").first();
  assert.match(await turn.locator(".a").textContent(), /didn't catch the place's name\. Did you mean/);
  const names = await turn.locator(".nearrow button").allTextContents();
  // the closest by sound, best first: Casa Nostra, then San Mezcal or another (the made-up test city has ids 1-6 of its own, so a
  // San Miguel name with one of those ids shows under the test city's name)
  assert.equal(names[0], "Casa Nostra", JSON.stringify(names));
  assert.ok(names.length >= 2 && names.length <= 3, JSON.stringify(names));
  await turn.locator(".nearrow button", { hasText: "Casa Nostra" }).click();
  await page.waitForFunction(() => document.querySelectorAll("#convo .turn").length === 2);
  const next = page.locator("#convo .turn").first();
  assert.equal(await next.locator(".q").textContent(), "Is Casa Nostra open?");
  assert.match(await next.locator(".one").textContent(), /Casa Nostra/);
  assert.deepEqual(errors, []);
  await browser.close();
});

// Learning from picks (owner, 22 Nov 2026: "build option 1"): the visitor taps Casa Nostra among "Did you mean"; the phone keeps how
// the ears heard it; on the next visit the same question is answered about Casa Nostra at once.
test("a pick among 'Did you mean' is remembered on the phone: next visit the same question is answered directly", { skip, timeout: 480000 }, async () => {
  const profile = mkdtempSync(join(tmpdir(), "p5-learn-"));
  try {
    let { browser, page, errors, heard } = await askAloud("acc-51-0-da_DK-talesyntese-medium.wav", profile);
    console.log(JSON.stringify({ first: heard.text, spot: (heard.spot || []).slice(0, 2), heardId: heard.heardId }));
    let turn = page.locator("#convo .turn").first();
    assert.ok(await turn.locator(".nearrow button").count() > 0, "this clip is asked about (Casa Nostra and others close by sound)");
    await turn.locator(".nearrow button", { hasText: "Casa Nostra" }).click();  // the pick teaches the ears
    await page.waitForSelector("#convo .turn .learned", { timeout: 15000 });
    assert.equal(await page.locator("#convo .turn .learned").textContent(), "I'll remember how you say Casa Nostra, on this phone.");
    const kept = await page.evaluate(() => JSON.parse(localStorage.getItem("sma-ask:names-learned")));
    assert.equal(kept.length, 1);
    assert.equal(kept[0].id, "51");
    assert.ok(kept[0].phones.length >= 3, JSON.stringify(kept));
    assert.equal(await page.evaluate(() => document.getElementById("learnedState").hidden), false);
    assert.match(await page.evaluate(() => document.querySelector("#learnedState span").textContent), /has learned how you say 1 name, on this phone/);
    assert.deepEqual(errors, []);
    await browser.close();

    ({ browser, page, errors, heard } = await askAloud("acc-51-0-da_DK-talesyntese-medium.wav", profile));  // the next visit
    console.log(JSON.stringify({ again: heard.text, spot: (heard.spot || []).slice(0, 2) }));
    assert.equal(heard.spot[0].name, "Casa Nostra");
    assert.ok(heard.spot[0].perSound < 1, `learned: ${heard.spot[0].perSound}`);
    turn = page.locator("#convo .turn").first();
    assert.equal(await turn.locator(".bysound").textContent(), "Heard as Casa Nostra");
    assert.match(await turn.locator(".one").textContent(), /Casa Nostra/);
    assert.equal(await turn.locator(".nearrow").count(), 0, "no need to ask");
    // Voice settings: forget them
    await page.evaluate(() => document.getElementById("forgetNames").click());
    assert.equal(await page.evaluate(() => localStorage.getItem("sma-ask:names-learned")), "[]");
    assert.equal(await page.evaluate(() => document.getElementById("learnedState").hidden), true);
    assert.deepEqual(errors, []);
    await browser.close();
  } finally { rmSync(profile, { recursive: true, force: true }); }
});
