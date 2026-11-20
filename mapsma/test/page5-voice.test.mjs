// /page5's "This phone's own voice" (owner, 20 Nov 2026: "I'm not hearing a voice speak in Spanish or in English unless I pick tiny
// Voca - the devices own voice doesn't work"). The real page in Chromium with a stand-in for the browser's speech (speechSynthesis):
// its voices arrive late, as on Chrome and Android; it can be made to never start, as when an iPhone's silent switch or a missing
// voice keeps it quiet. Checked: one sentence at a time, never right after a cancel, the right voice once the list arrives, on an
// iPhone the media sound session and silence on the player while it speaks, and a clear message (or tiny-voca) when it stays silent.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium = null, devices = {};
try { ({ chromium, devices } = require("playwright")); } catch { try { ({ chromium, devices } = require("/opt/node-tools/node_modules/playwright")); } catch { /* skipped */ } }
const skip = chromium ? false : "Playwright is not installed";
const HERE = fileURLToPath(new URL(".", import.meta.url));
const P5 = HERE + "../page5/", LIVE = P5 + "live-2026-11-20/";
const FILES = { "/page5/": P5 + "index.html", "/page5/ask.js": P5 + "ask.js", "/page5/words.js": P5 + "words.js", "/page5/rules.js": P5 + "rules.js",
  "/page5/susan.js": P5 + "susan.js", "/page5/read.js": LIVE + "read.js", "/page5/listen.js": LIVE + "listen.js", "/page5/spanish.js": LIVE + "spanish.js",
  "/places.js": HERE + "fixtures/data.js", "/i18n.js": HERE + "fixtures/i18n.js", "/icons.js": HERE + "fixtures/icons.js",
  "/photos/selected.json": HERE + "fixtures/photos/selected.json", "/photos/hours.json": HERE + "fixtures/photos/hours.json" };
const INLINE = { "/page5/facts.js": "window.FACTS={};", "/descs.js": "window.DESCS={};",
  "/page5/tinyvoca-worker.js": "onmessage = () => {};  // a stand-in tiny-voca that is still loading: the page's message stays" };
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

// The stand-in: voices after 300 ms; speak() starts and ends each sentence (or, silent, never starts); everything is logged.
function fakeSpeech(silent) {
  const log = (window.__speech = []), t0 = performance.now(), at = () => Math.round(performance.now() - t0);
  const VOICES = [{ name: "Samantha", lang: "en-US" }, { name: "Daniel", lang: "en-GB" }, { name: "Paulina", lang: "es-MX" }, { name: "Mónica", lang: "es-ES" }]
    .map((v) => ({ ...v, localService: true, default: false, voiceURI: v.name }));
  let voices = [], queue = [], current = null;
  const listeners = [];
  setTimeout(() => { voices = VOICES; listeners.forEach((f) => f()); }, 300);
  const run = () => {
    if (current || !queue.length) return;
    current = queue.shift();
    if (silent) return;
    const u = current;
    setTimeout(() => { u.onstart?.(); setTimeout(() => { current = null; u.onend?.(); run(); }, 40); }, 10);
  };
  const synth = {
    get speaking() { return !!current; }, get pending() { return queue.length > 0; },
    getVoices: () => voices,
    addEventListener: (k, f) => { if (k === "voiceschanged") listeners.push(f); },
    removeEventListener: (k, f) => { const i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); },
    speak(u) { log.push({ at: at(), call: "speak", text: u.text, voice: u.voice?.name || null, lang: u.lang, volume: u.volume }); queue.push(u); run(); },
    cancel() { log.push({ at: at(), call: "cancel" }); queue = []; current = null; },
    resume() {}, pause() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(text) { Object.assign(this, { text, voice: null, lang: "", volume: 1, rate: 1, pitch: 1 }); } };  // takes the stand-in voices
  const audio = { type: "auto" };
  window.__sessions = [];
  Object.defineProperty(navigator, "audioSession", { value: new Proxy(audio, { set(o, k, v) { o[k] = v; if (k === "type") window.__sessions.push(v); return true; } }), configurable: true });
}

async function open({ lang = "en", silent = false, iphone = false } = {}) {
  const context = await browser.newContext(iphone ? { ...devices["iPhone 13"] } : {});
  await context.addInitScript(fakeSpeech, silent);
  await context.addInitScript(([l]) => { try { localStorage.setItem("sma-lang", l); localStorage.setItem(l === "es" ? "sma-ask:voice-es" : "sma-ask:voice", "system"); } catch { /* none */ } }, [lang]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${port}/page5/`);
  await page.click(`.sp-lang[data-lang="${lang}"]`);
  await page.waitForLoadState("load");
  await page.waitForFunction((l) => window.LANG === l && document.getElementById("testVoice"), lang);
  await page.waitForTimeout(300);
  assert.equal(await page.inputValue("#voice"), "system");
  await page.evaluate(() => document.getElementById("testVoice").click());
  return { page, errors, speech: () => page.evaluate(() => window.__speech), sessions: () => page.evaluate(() => window.__sessions) };
}

test("English: once the voices arrive, the sentences are spoken one after another, never right after a cancel", { skip }, async () => {
  const { page, errors, speech } = await open();
  await page.waitForFunction(() => window.__speech.filter((x) => x.call === "speak" && x.text.length > 1).length === 2, null, { timeout: 5000 });
  const log = await speech(), said = log.filter((x) => x.call === "speak" && x.text.length > 1);
  assert.deepEqual(said.map((x) => x.text), ["Hello from San Miguel de Allende.", "If you can hear me, the voice works."]);
  assert.equal(said[0].voice, "Daniel", "a male English voice, from the list that arrived late");
  assert.ok(said[0].at >= 300, "it waited for the list of voices");
  const unlock = log.find((x) => x.call === "speak" && x.volume === 0);
  assert.ok(unlock && said[0].at - unlock.at >= 250, "a pause after the silent unlock before the first sentence");
  assert.ok(said[1].at - said[0].at >= 40, "the second sentence only after the first ended");
  assert.doesNotMatch(await page.evaluate(() => document.body.innerText), /did not start/);
  assert.deepEqual(errors, []);
});

test("Spanish on an iPhone: the Mexican voice, a media sound session and silence on the player while it speaks", { skip }, async () => {
  const { page, errors, speech, sessions } = await open({ lang: "es", iphone: true });
  await page.waitForFunction(() => window.__speech.filter((x) => x.call === "speak" && x.text.length > 1).length === 2, null, { timeout: 5000 });
  const said = (await speech()).filter((x) => x.call === "speak" && x.text.length > 1);
  assert.equal(said[0].voice, "Paulina");
  assert.equal(said[0].lang, "es-MX");
  assert.ok((await sessions()).includes("playback"), "asked for the media sound session (the silent switch leaves it alone)");
  assert.deepEqual(errors, []);
});

test("a voice that never starts: the page says why, and on the English page tiny-voca reads instead", { skip, timeout: 20000 }, async () => {
  let { page, errors } = await open({ silent: true, iphone: true });
  await page.waitForFunction(() => /own voice did not start/.test(document.body.innerText), null, { timeout: 8000 });
  const text = await page.evaluate(() => document.body.innerText);
  assert.match(text, /tiny-voca reads instead/);
  assert.match(text, /side switch from silent to ring/);
  assert.deepEqual(errors, []);
  ({ page, errors } = await open({ lang: "es", silent: true }));
  await page.waitForFunction(() => /La voz de este teléfono no arrancó/.test(document.body.innerText), null, { timeout: 8000 });
  assert.match(await page.evaluate(() => document.body.innerText), /voz instalada/);
  assert.deepEqual(errors, []);
});
