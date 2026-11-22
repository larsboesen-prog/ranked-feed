// /page5 answers about streets, hotels and quality (owner, 22 Nov 2026: "show me some high end restaurants, show me restaurants on
// umaran, show me some quality restaurants … show me restaurants in live aqua … Seems restaurants and street names fail"). The page's
// own asker (page5/ask.js, read.js, words.js) on the site's data as of 18 Nov (tiny-speech's test/fixtures/before/mapsma-page5).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const P5 = HERE + "../page5/", TS = HERE + "../../tiny-speech/";
const dir = mkdtempSync(join(tmpdir(), "p5-streets-"));
for (const f of ["ask.js", "read.js", "rules.js", "words.js"]) copyFileSync(P5 + f, join(dir, f));
for (const f of ["data.json", "facts.js", "susan.js", "hours.json", "photos.json"]) copyFileSync(TS + "test/fixtures/before/mapsma-page5/" + f, join(dir, f));
const { loadSite } = await import(TS + "test/golden/mapsma.mjs");
const site = await loadSite(dir);
const ask = await import(join(dir, "ask.js"));
rmSync(dir, { recursive: true, force: true });
const now = ask.nowMX(new Date("2026-11-22T02:00:00Z"));  // Saturday 20:00 in San Miguel
const en = (t) => site.askers.en.answer(t, now), es = (t) => site.askers.es.answer(t, now);

test("restaurants on a street: the places on it, in either language; a name that is also a street stays a name", () => {
  let a = en("show me restaurants on umaran");
  assert.equal(a.q.street.key, "umaran");
  assert.match(a.show, / on Umarán\./);
  a = en("restaurants on mesones");
  assert.match(a.show, /^4 places on Mesones\./);
  a = es("restaurantes en la calle umaran");
  assert.match(a.show, / en la calle Umarán\./);
  a = en("is cafe umaran open");
  assert.equal(a.kind, "one");
  assert.match(a.show, /Café Umarán/);
});

test("hotels: near the Rosewood, nearest first; Live Aqua has none on MapSMA: 'in' says so, both show the nearest to its pin", () => {
  let a = en("show me restaurants near the rosewood");
  assert.match(a.show, /^4 places near the Rosewood\./);
  assert.equal(a.ids[0], "62", "Luna Rooftop, in the Rosewood, first");
  a = en("show me restaurants in live aqua");
  assert.match(a.show, /^I found no places in Live Aqua\. 4 places near Live Aqua\./);
  const m = a.ids.map((id) => a.dist[id]);
  assert.ok(m.every((x, i) => i === 0 || x >= m[i - 1]) && m[0] < 800, `nearest first: ${m}`);
  assert.match(en("show me restaurants near live aqua").show, /^4 places near Live Aqua\./);
  a = es("restaurantes en live aqua");
  assert.match(a.show, /^No encontré lugares en Live Aqua\. 4 lugares cerca de Live Aqua\./);
  assert.match(es("restaurantes cerca de live aqua").show, /^4 lugares cerca de Live Aqua\./);
});

test("quality and high end", () => {
  assert.match(en("show me some quality restaurants").show, /^4 of our favourite places\./);
  assert.match(en("show me some high end restaurants").show, /^4 upscale places\./);
});
