// /page5's live music venues (owner, 19 Nov 2026: "add venues"; 21 Nov: asked "Where is Johnny's piano bar" and got four other
// bars): Mama Mía, Raindog Cantina, Johnny's Piano Bar and Casa Europa are in tiny-speech's San Miguel pack but not in the site's
// data (places.js, made by the site's scripts/rebuild.py). Until they are, /page5 adds them from /page5/venues.js, made here from
// the pack: node mapsma/listings/build-venues.mjs  → mapsma/page5/venues.js
// Extra places (other: true, as the site's X1–X18): listed, not recommended; no photo or map pin. Their hours where the pack has them.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SRC = ROOT + "tiny-speech/packs/src/mx-sma/";
const read = (f) => JSON.parse(readFileSync(SRC + f, "utf8"));
const placesSrc = read("places.json"), hoursSrc = read("hours.json");
const all = Array.isArray(placesSrc) ? placesSrc : placesSrc.places;
const hours = hoursSrc.places || hoursSrc;
const venues = all.filter((p) => /Added 19 Nov 2026 as a (live )?music venue/.test(p.info?.note || ""));
if (venues.length !== 4) throw new Error(`expected the 4 venues, found ${venues.length}`);

const out = { places: [], info: {}, hours: {}, facts: {} };
for (const p of venues) {
  out.places.push({ id: p.id, name: p.name, cat: p.kind, lat: p.lat, lng: p.lng, area: p.area, desc: p.desc || "", acc: p.acc, other: true });
  const { address, source, hours: said } = p.info || {};
  out.info[p.id] = { ...(address ? { address } : {}), ...(source ? { source } : {}), ...(said ? { hours: said } : {}), pick: false };
  if (hours[p.id]?.h) out.hours[p.id] = hours[p.id].h;
  if (p.facts) out.facts[p.id] = p.facts;
}
const js = `/* /page5's live music venues, not yet in the site's data (places.js): made by mapsma/listings/build-venues.mjs from tiny-speech's
   San Miguel pack (21 Nov 2026). /page5 adds them as extra places when no place of the same name is there. */
window.VENUES = ${JSON.stringify(out)};
`;
writeFileSync(ROOT + "mapsma/page5/venues.js", js);
console.log(JSON.stringify({ venues: out.places.map((p) => `${p.id} ${p.name}`), with_hours: Object.keys(out.hours), bytes: js.length }));
