// /page5 reads its answers with MapSMA's own voice (owner, 21 Nov 2026: "Use this voice on mapsma"): the bilingual tiny-voca trained
// on the warm local guide (MX1), in the shared core's plain-JS worker, in Spanish on the Spanish page and in English on the English
// page. The real page in Chromium on the small made-up city, with the real worker and voice file (tiny-speech/vendor/tiny-voca/
// tiny-voca-mx1-2026-11-21.gguf, 8 MB), served as the site will serve them under /tiny-speech/.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join, normalize } from "node:path";

const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require("playwright")); } catch { try { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); } catch { /* skipped */ } }
const HERE = fileURLToPath(new URL(".", import.meta.url));
const TS = fileURLToPath(new URL("../../tiny-speech/", import.meta.url));
const VOICE = "vendor/tiny-voca/tiny-voca-mx1-2026-11-21.gguf";
const skip = !chromium ? "Playwright is not installed" : !existsSync(TS + VOICE) ? "the voice file is not here" : false;
const P5 = HERE + "../page5/", LIVE = P5 + "live-2026-11-20/";
const FILES = { "/page5/": P5 + "index.html", "/page5/ask.js": P5 + "ask.js", "/page5/words.js": P5 + "words.js", "/page5/rules.js": P5 + "rules.js",
  "/page5/susan.js": P5 + "susan.js", "/page5/read.js": P5 + "read.js", "/page5/listen.js": P5 + "listen.js", "/page5/spanish.js": LIVE + "spanish.js",
  "/places.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js", "/icons.js": HERE + "fixtures/icons.js",
  "/photos/selected.json": HERE + "fixtures/photos/selected.json", "/photos/hours.json": HERE + "fixtures/photos/hours.json" };
const INLINE = { "/page5/facts.js": "window.FACTS={};", "/descs.js": "window.DESCS={};" };
const TYPE = (p) => (p.endsWith("/") || p.endsWith(".html") ? "text/html; charset=utf-8" : p.endsWith(".json") ? "application/json" : p.endsWith(".gguf") ? "application/octet-stream" : "text/javascript");
let server, port, browser;
before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (INLINE[path]) { res.writeHead(200, { "content-type": TYPE(path) }); return res.end(INLINE[path]); }
    let file = FILES[path];
    if (!file && path.startsWith("/tiny-speech/")) {  // the shared core, laid out on the site as in the repository
      file = normalize(join(TS, path.slice("/tiny-speech/".length)));
      if (!file.startsWith(TS)) file = null;
    }
    if (!file || !existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPE(file) });
    res.end(await readFile(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
  browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
});
after(async () => { await browser?.close(); server?.close(); });

// What the page and its voice worker say to each other.
function watchWorkers() {
  window.__voice = { urls: [], sent: [], got: [] };
  const Real = window.Worker;
  window.Worker = class extends Real {
    constructor(url, opts) {
      super(url, opts);
      if (!/tinyvoca/.test(String(url))) return;
      window.__voice.urls.push(String(url));
      this.addEventListener("message", ({ data }) => window.__voice.got.push({ type: data.type, voices: data.voices, index: data.index, samples: data.audio ? data.audio.length : 0 }));
    }
    postMessage(msg, transfer) { if (window.__voice.urls.length) window.__voice.sent.push({ type: msg.type, voice: msg.voice, lang: msg.lang, n: (msg.sentences || []).length }); return super.postMessage(msg, transfer); }
  };
}

async function testVoice(lang) {
  const context = await browser.newContext();
  await context.addInitScript(watchWorkers);
  await context.addInitScript((l) => { try { localStorage.setItem("sma-lang", l); } catch { /* none */ } }, lang);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${port}/page5/`);
  await page.click(`.sp-lang[data-lang="${lang}"]`);
  await page.waitForLoadState("load");
  await page.waitForFunction((l) => window.LANG === l && document.getElementById("testVoice"), lang);
  const chosen = await page.inputValue("#voice");
  await page.evaluate(() => document.getElementById("testVoice").click());
  await page.waitForFunction(() => window.__voice.got.filter((m) => m.type === "sentence").length >= 2 || window.__voice.got.some((m) => m.type === "error"), null, { timeout: 120000 });
  const v = await page.evaluate(() => window.__voice);
  await context.close();
  return { chosen, v, errors };
}

test("Spanish page: MapSMA's voice is the default and reads Spanish as MX1", { skip, timeout: 150000 }, async () => {
  const { chosen, v, errors } = await testVoice("es");
  assert.equal(chosen, "tinyvoca", "MapSMA's voice, not the phone's, by default in Spanish");
  assert.match(v.urls[0], /^\/tiny-speech\/browser\/tinyvoca-js-worker\.js\?.*model=%2Ftiny-speech%2Fvendor%2Ftiny-voca%2Ftiny-voca-mx1-2026-11-21\.gguf&sha256=921d4f84/);
  const ready = v.got.find((m) => m.type === "ready");
  assert.deepEqual(ready.voices, ["F2", "M2", "MX1"]);
  const speak = v.sent.find((m) => m.type === "speak");
  assert.deepEqual({ voice: speak.voice, lang: speak.lang, n: speak.n }, { voice: 2, lang: "es", n: 2 });
  const said = v.got.filter((m) => m.type === "sentence");
  assert.equal(said.length, 2);
  assert.ok(said.every((m) => m.samples > 24000 * 0.8), "each sentence is real audio (24 kHz)");
  assert.deepEqual(v.got.filter((m) => m.type === "error"), []);
  assert.deepEqual(errors, []);
});

test("English page: the same voice reads English", { skip, timeout: 150000 }, async () => {
  const { chosen, v, errors } = await testVoice("en");
  assert.equal(chosen, "tinyvoca");
  const speak = v.sent.find((m) => m.type === "speak");
  assert.deepEqual({ voice: speak.voice, lang: speak.lang }, { voice: 2, lang: "en" });
  assert.equal(v.got.filter((m) => m.type === "sentence").length, 2);
  assert.deepEqual(errors, []);
});
