// /page5 listens with MapSMA's ears (owner, 21 Nov 2026: "Deploy to page 5"): tiny-speech's tiny ears (8.9 MB, San Miguel's word
// list) in the shared core's worker, Whisper tiny kept as a choice in Voice settings and taken automatically if the ears cannot load.
// The real page in Chromium on the small made-up city, with the real worker, model and word list served as the site will serve them
// under /tiny-speech/, and a fake microphone playing a recorded Mexican Spanish question. Needs cdn.jsdelivr.net (onnxruntime-web).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join, normalize } from "node:path";

const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require("playwright")); } catch { try { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); } catch { /* skipped */ } }
const HERE = fileURLToPath(new URL(".", import.meta.url));
const TS = fileURLToPath(new URL("../../tiny-speech/", import.meta.url));
const EARS = "engines/ears/ears-int8-2026-11-20.onnx";
const skip = !chromium ? "Playwright is not installed" : !existsSync(TS + EARS) ? "the ears model is not here" : false;
const CLIP = JSON.parse(readFileSync(TS + "test/fixtures/ears/clips.json", "utf8")).clips.find((c) => /raindog/i.test(c.said));
const P5 = HERE + "../page5/", LIVE = P5 + "live-2026-11-20/";
const FILES = { "/page5/": P5 + "index.html", "/page5/ask.js": P5 + "ask.js", "/page5/words.js": P5 + "words.js", "/page5/rules.js": P5 + "rules.js",
  "/page5/susan.js": P5 + "susan.js", "/page5/read.js": LIVE + "read.js", "/page5/listen.js": LIVE + "listen.js", "/page5/spanish.js": LIVE + "spanish.js",
  "/page5/pcm-worklet.js": TS + "browser/pcm-worklet.js",
  "/places.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js", "/icons.js": HERE + "fixtures/icons.js",
  "/photos/selected.json": HERE + "fixtures/photos/selected.json", "/photos/hours.json": HERE + "fixtures/photos/hours.json" };
const INLINE = { "/page5/facts.js": "window.FACTS={};", "/descs.js": "window.DESCS={};" };
const TYPE = (p) => (p.endsWith("/") || p.endsWith(".html") ? "text/html; charset=utf-8" : p.endsWith(".json") ? "application/json" : /\.(gguf|onnx)$/.test(p) ? "application/octet-stream" : "text/javascript");
let server, port, browser, hideEars = false;
before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (INLINE[path]) { res.writeHead(200, { "content-type": TYPE(path) }); return res.end(INLINE[path]); }
    let file = FILES[path];
    if (!file && path.startsWith("/tiny-speech/")) {  // the shared core as on the site: the repository's folders, packs/dist/ as packs/
      const rest = path.slice("/tiny-speech/".length).replace(/^packs\//, "packs/dist/");
      file = normalize(join(TS, rest));
      if (!file.startsWith(TS) || (hideEars && file.endsWith(".onnx"))) file = null;
    }
    if (!file || !existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPE(file) });
    res.end(await readFile(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  browser = await chromium.launch({
    ...(proxy ? { proxy: { server: proxy, bypass: "localhost,127.0.0.1" } } : {}),
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${TS}test/fixtures/ears/${CLIP.wav}%noloop`],
  });
});
after(async () => { await browser?.close(); server?.close(); });

// What the page and its speech worker say to each other.
function watchAsr() {
  window.__asr = { urls: [], sent: [], got: [] };
  const Real = window.Worker;
  window.Worker = class extends Real {
    constructor(url, opts) {
      super(url, opts);
      if (!/asr-worker/.test(String(url))) { this.__other = true; return; }
      window.__asr.urls.push(String(url));
      this.addEventListener("message", ({ data }) => { if (data.type !== "progress") window.__asr.got.push({ type: data.type, id: data.id, text: data.text, error: data.error, engine: data.engine }); });
    }
    postMessage(msg, transfer) { if (!this.__other) window.__asr.sent.push({ type: msg.type, model: msg.model, language: msg.language, hint: msg.hint }); return super.postMessage(msg, transfer); }
  };
}

async function open(lang, engine = null) {
  const context = await browser.newContext({ permissions: ["microphone"] });
  await context.addInitScript(watchAsr);
  await context.addInitScript(([l, e]) => { try { if (sessionStorage.getItem("t-set")) return; sessionStorage.setItem("t-set", "1"); localStorage.setItem("sma-lang", l); localStorage.setItem(l === "es" ? "sma-ask:voice-es" : "sma-ask:voice", "off"); if (e) localStorage.setItem("sma-ask:asr", e); } catch { /* none */ } }, [lang, engine]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${port}/page5/`);
  await page.click(`.sp-lang[data-lang="${lang}"]`);
  await page.waitForLoadState("load");
  await page.waitForFunction((l) => window.LANG === l && document.getElementById("asr"), lang);
  return { context, page, errors, asr: () => page.evaluate(() => window.__asr) };
}

test("a spoken Spanish question: heard by MapSMA's ears, word for word as the probe heard it, with no name hint", { skip, timeout: 180000 }, async () => {
  const { context, page, errors, asr } = await open("es");
  assert.equal(await page.inputValue("#asr"), "ears", "MapSMA's ears by default");
  await page.waitForFunction(() => window.__asr.got.some((m) => m.type === "ready" || m.type === "error"), null, { timeout: 120000 });
  await page.click("#mic");
  await page.waitForFunction(() => window.__asr.got.some((m) => m.type === "text"), null, { timeout: 60000 });
  const a = await asr();
  assert.match(a.urls[0], /^\/tiny-speech\/browser\/asr-worker\.js\?v=0\.3\.0&libs=mapsma-voice-libs-1&ears=%2Ftiny-speech%2Fengines%2Fears%2Fears-int8-2026-11-20\.onnx&lexicon=%2Ftiny-speech%2Fpacks%2Fmx-sma%2Fears-lexicon-es\.json%3Fv%3D\d{8}$/, "the Spanish page loads the list leaning to Spanish");
  const said = a.sent.find((m) => m.type === "transcribe");
  assert.equal(said.model, "tiny-ears");
  assert.equal(said.hint, undefined, "the ears need no names hint");
  const heard = a.got.find((m) => m.type === "text");
  assert.equal(heard.error, undefined);
  assert.equal(heard.engine, "tiny-ears");
  assert.equal(heard.text, CLIP.probe_heard);
  console.log(JSON.stringify({ said: CLIP.said, heard: heard.text }));
  assert.deepEqual(errors, []);
  await context.close();
});

test("Whisper tiny chosen in Voice settings: the page asks for Whisper", { skip, timeout: 60000 }, async () => {
  const { context, page, errors, asr } = await open("en", "whisper");
  assert.equal(await page.inputValue("#asr"), "whisper");
  await page.waitForFunction(() => window.__asr.sent.some((m) => m.type === "load"), null, { timeout: 20000 });
  assert.equal((await asr()).sent.find((m) => m.type === "load").model, "onnx-community/whisper-tiny.en");
  assert.match((await asr()).urls[0], /ears-lexicon-en\.json/, "the English page loads the list leaning to English");
  assert.deepEqual(errors, []);
  await context.close();
});

test("the ears' file missing: the page loads Whisper instead, by itself", { skip, timeout: 120000 }, async () => {
  hideEars = true;
  try {
    const { context, page, errors, asr } = await open("es");
    await page.waitForFunction(() => window.__asr.sent.filter((m) => m.type === "load").length >= 2, null, { timeout: 60000 });
    const a = await asr();
    assert.deepEqual(a.sent.filter((m) => m.type === "load").map((m) => m.model), ["tiny-ears", "onnx-community/whisper-tiny"]);
    assert.ok(a.got.some((m) => m.type === "error" && m.id === "tiny-ears"));
    assert.deepEqual(errors, []);
    await context.close();
  } finally { hideEars = false; }
});

// The reminder to switch (owner, 22 Nov 2026: "remind those who maybe speak Spanish sentences to english ui to switch to Spanish ui -
// exclude location names"): a Spanish question on the English page brings it, in Spanish, once; its button switches the page.
test("a Spanish question on the English page: a reminder, in Spanish, to switch; its button switches the page", { skip, timeout: 180000 }, async () => {
  const { context, page, errors, asr } = await open("en");
  await page.waitForFunction(() => window.__asr.got.some((m) => m.type === "ready" || m.type === "error"), null, { timeout: 120000 });
  await page.click("#mic");
  await page.waitForFunction(() => window.__asr.got.some((m) => m.type === "text"), null, { timeout: 60000 });
  const heard = (await asr()).got.find((m) => m.type === "text").text;
  await page.waitForSelector(".turn .langtip", { timeout: 10000 });
  const tip = await page.textContent(".turn .langtip");
  console.log(JSON.stringify({ heard, tip }));
  assert.match(tip, /¿Hablas español\? Cambia la página a Español/);
  await Promise.all([page.waitForEvent("load"), page.click(".turn .langtip button")]);
  await page.waitForFunction(() => window.LANG === "es", null, { timeout: 10000 });
  assert.equal(await page.evaluate(() => localStorage.getItem("sma-lang")), "es");
  assert.deepEqual(errors, []);
  await context.close();
});

test("the same Spanish question on the Spanish page: no reminder", { skip, timeout: 180000 }, async () => {
  const { context, page, errors } = await open("es");
  await page.waitForFunction(() => window.__asr.got.some((m) => m.type === "ready" || m.type === "error"), null, { timeout: 120000 });
  await page.click("#mic");
  await page.waitForFunction(() => window.__asr.got.some((m) => m.type === "text"), null, { timeout: 60000 });
  await page.waitForSelector(".turn .a", { timeout: 10000 });
  await page.waitForTimeout(1500);
  assert.equal(await page.$(".turn .langtip"), null);
  assert.deepEqual(errors, []);
  await context.close();
});
