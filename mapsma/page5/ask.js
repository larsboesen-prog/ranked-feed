// MapSMA /page5 (Ask by voice, 17 Nov 2026): answers questions about the places on this site in the browser, from the files the
// site already serves (data.js, photos/hours.json, photos/selected.json, susan.js). No server, no AI model: Lars, 17 Nov 2026,
// "Consider having the 80 so restaurant data in text locally so no need to check server".
//
// Three kinds of question (Lars's examples):
//   a list    "Find 4 restaurants in Centro that are open in the next 2 hours"      -> up to N cards, as on /page2
//   one place "Is La Azotea open?"                                                 -> one card, as on /page2/#60
//   Susan     "Surprise me: three restaurants Susan York reviewed that are open now" -> her picks (susan.js), at random
// "4 more" continues the last list. Anything else is searched in the names, areas and descriptions.
//
// The opening-hours rules are the ones on /page2 and /page3 (San Miguel time; Monday = "0"; "13:00–01:00" runs past midnight), and
// "open now" means open now or opening within two hours (Lars: "open now (next 2 hrs)"). A place that closes within 45 minutes does
// not count as open: the cards call that "Closing soon".

// Reading the question (words -> request) lives in read.js; this file answers requests; words.js says the answers in English and
// Spanish; rules.js holds the rules. The same ?v= as index.html's.
import { fold, SOON, parse, TOPIC, dayOff, createReader, streetIndex } from './read.js?v=20261122s';
export { fold, SOON, parse, sound, requestOf } from './read.js?v=20261118f';
import { RULES, span as ruleSpan } from './rules.js?v=20261118f';  // the answer rules, in one place (rules.js)
import { WORDS } from './words.js?v=20261122s';  // the words of the answers, English and Spanish (words.js)
// the time, number and distance words, for anything that took them from here (index.html: DAYNAMES, showDist)
export { DAYNAMES, DIAS, clock, sayTime, sayTimeEs, aTimeEs, showTimeEs, sayNum, sayNumEs, sayDist, sayDistEs, showDist, showDistEs, sayName, walkMin } from './words.js?v=20261122s';

export const EAT = ['bfast', 'mex', 'world', 'street', 'share', 'roof'];

export const MIN_LEFT = RULES.closingSoon;           // minutes a place must stay open to count as open
export const CENTRO_M = RULES.centroRadius;          // the historic centre: within this distance of the Jardín
export const RECENT_DAYS = RULES.susanRecentDays;    // Susan York's "recent" picks
export const WALK_M_PER_MIN = RULES.walkMetresPerMinute;  // walking on San Miguel's hills and cobbles
export const FAR_M = RULES.nearMeWithin;             // farther than this from the Jardín, "near me" is measured from the Jardín instead
// Metres between two points (how far a place is: words.js says it).
export function metres(a, b) {
  const R = 6371000, rad = Math.PI / 180, x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad), y = (b.lat - a.lat) * rad;
  return R * Math.hypot(x, y);
}

// San Miguel's day (Monday = 0) and minute of the day, for a moment (default: now).
export function nowMX(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(date).map((x) => [x.type, x.value]));
  return { d: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday), m: (+parts.hour % 24) * 60 + (+parts.minute), date };
}
const toMin = (t) => { const [a, b] = t.split(':').map(Number); return a * 60 + b; };
export const ranges = (s) => s.split(', ').map((r) => { const [a, b] = r.split('–'); const s0 = toMin(a); let e = toMin(b); if (e <= s0) e += 1440; return [s0, e]; });

const stop = (s) => (/[.!?]$/.test(s) ? s : s + '.');

// ---------- the answers ----------
export function createAsker({ places, INFO, HOURS, CATS, ALSO = {}, SUSAN = null, FACTS = {}, STATUS = {}, shown = () => true, random = Math.random, lang = 'en' }) {
  const W = WORDS[lang === 'es' ? 'es' : 'en'];  // the answers' words (the page's EN / ES switch); the questions are read in either language
  const byId = Object.fromEntries(places.map((p) => [p.id, p]));
  const isSight = (p) => p.cat === 'sights';
  const catsOf = (p) => [p.cat, ...(ALSO[p.id] || [])];
  const jardin = byId.S2 || { lat: 20.91445, lng: -100.74375 };
  const dist = (p) => {
    const R = 6371000, rad = Math.PI / 180, x = (p.lng - jardin.lng) * rad * Math.cos(((p.lat + jardin.lat) / 2) * rad), y = (p.lat - jardin.lat) * rad;
    return R * Math.hypot(x, y);
  };
  const inCentro = (p) => dist(p) <= CENTRO_M && !/^Guadalupe/.test(p.area);
  // Where distances are measured from: the phone, when it is in or near San Miguel; else the Jardín.
  const origin = (here) => (here && metres(here, jardin) <= FAR_M ? { o: here, mine: true } : { o: jardin, mine: false, far: !!here });
  const picks = Object.fromEntries(((SUSAN && SUSAN.picks) || []).filter((x) => byId[x.id]).map((x) => [x.id, x]));
  const F = (p) => (FACTS && FACTS[p.id]) || {};  // facts.js: cuisine c, dishes d, price p, features f, what it is w, why unusual u
  const textOf = (p) => fold([p.name, p.desc, (picks[p.id] || {}).note, (picks[p.id] || {}).note_es, F(p).w, F(p).w_es, F(p).u].join(' '));
  function topicScore(p, t) {  // how well a place matches a topic: 0 not at all, 1 by its words, 2 a cuisine, dish or feature, 3 its kind or main cuisine
    const f = F(p), c = f.c || [], ft = f.f || [], d = f.d || [];
    let sc = 0;
    if (t.cat && catsOf(p).some((x) => t.cat.includes(x))) sc = t.cs || 3;
    if (t.c) { if (c.length && t.c.includes(c[0])) sc = Math.max(sc, 3); else if (c.some((x) => t.c.includes(x))) sc = Math.max(sc, 2.5); }
    if (t.f && ft.some((x) => t.f.includes(x))) sc = Math.max(sc, t.fs || 2);
    if (t.d && d.some((x) => t.d.some((w) => (' ' + x).includes(' ' + w)))) sc = Math.max(sc, 2);
    if (t.extra) sc = Math.max(sc, t.extra(p, f));
    if (!sc && t.t) { const hay = ' ' + textOf(p).replace(/[^a-z0-9]+/g, ' '); if (t.t.some((w) => hay.includes(' ' + w))) sc = 1; }
    return sc;
  }
  // Cafés are their own kind (Lars, 18 Nov 2026, his screenshot of cafés in an answer at 8:20: "Needs to separate restaurants and cafes so
  // for dinner or lunch not showing coffee places and not always showing by default"): coffee and bakery places, and places whose main
  // food is coffee, bread, sweets, ice cream or breakfast.
  const CAFE_MAIN = ['coffee', 'bakery', 'pastries', 'desserts', 'ice_cream', 'breakfast', 'brunch', 'juice', 'chocolate'];
  const isCafe = (p) => { const c = F(p).c || []; return catsOf(p).includes('bfast') || CAFE_MAIN.includes(c[0]) || (c.includes('coffee') && c.includes('breakfast')); };
  const CAFE_TOPICS = new Set(['coffee', 'bakery', 'croissant', 'desserts', 'icecream', 'chocolate', 'brunch', 'breakfast', 'sandwich', 'healthy', 'wifi',
    'dish:pancakes', 'dish:waffles', 'dish:French toast', 'dish:avocado toast', 'dish:chilaquiles', 'dish:churros', 'dish:crêpes', 'dish:huevos rancheros']);
  // Cafés belong in an answer when the question is about breakfast, coffee, bread or sweets, or asks for a kind of place they can be;
  // never for lunch, dinner, tonight, late night or "restaurants"; and when nothing is asked, only in the morning (5:00-11:30).
  function cafesWanted(q, n) {
    const meal = q.meal || q.mealNow || q.lateMeal;
    if (meal === 'bfast' || meal === 'brunch' || (q.topics || []).some((k) => CAFE_TOPICS.has(k)) || (q.cats || []).includes('bfast')) return true;
    if (meal === 'lunch' || meal === 'dinner' || meal === 'late' || meal === 'tonight' || q.restaurantWord) return false;
    if ((q.topics || []).length || q.unique || q.susan || q.local || q.price) return true;
    const [a, b] = ruleSpan(RULES.cafesWhenNothingAsked);
    return n.m >= a && n.m < b;
  }
  const cheap = (p) => F(p).p === 1;
  const fancy = (p) => (F(p).p || 0) >= 3 || (F(p).c || []).some((x) => x === 'fine_dining' || x === 'tasting_menu');
  const midPrice = (p) => F(p).p != null && F(p).p <= 2;
  // "where do locals eat": cheap Mexican food, or a place whose main cooking is traditional or home-style
  const local = (p) => (cheap(p) && (catsOf(p).some((c) => c === 'mex' || c === 'street') || (F(p).c || []).some((x) => ['mexican', 'traditional_mexican', 'home_style', 'tacos', 'birria', 'street_food'].includes(x))))
    || ['traditional_mexican', 'home_style'].includes((F(p).c || [])[0]);
  const sightName = (id) => W.sightName(id) || byId[id].name;  // "near the Parroquia", "cerca de la Parroquia"

  // The opening spans from yesterday to a week ahead, in minutes from today's midnight in San Miguel (yesterday's late night runs into
  // today), touching spans joined. null when today's hours are not published.
  function spans(id, n) {
    const h = HOURS[id];
    if (!h || h[String(n.d)] === undefined) return null;
    const out = [];
    for (let k = -1; k <= 7; k++) {
      const t = h[String((n.d + k + 7) % 7)];
      if (typeof t === 'string') for (const [a, b] of ranges(t)) out.push([a + 1440 * k, b + 1440 * k]);
    }
    out.sort((a, b) => a[0] - b[0]);
    const joined = [];
    for (const x of out) { const last = joined[joined.length - 1]; if (last && x[0] <= last[1]) last[1] = Math.max(last[1], x[1]); else joined.push([...x]); }
    return joined;
  }
  // Right now: open (until when) or closed (opening when). null when the hours are unknown.
  function avail(id, n) {
    const sp = spans(id, n);
    if (!sp) return null;
    const cur = sp.find(([a, b]) => a <= n.m && n.m < b), next = sp.find(([a]) => a > n.m);
    return { open: !!cur, until: cur ? cur[1] : null, left: cur ? cur[1] - n.m : 0, at: next ? next[0] : null, wait: next ? next[0] - n.m : null, closedToday: HOURS[id][String(n.d)] === null };
  }
  const openNow = (a) => !!a && a.open && a.left >= MIN_LEFT;
  const fits = (a, w) => openNow(a) || (!!a && a.at != null && a.wait <= w);
  // Meals, as in the "When?" menu on /page2: open long enough inside the meal's hours, today or, once they have passed, tomorrow.
  const MEALS = Object.fromEntries(Object.entries(RULES.meals).map(([k, v]) => [k, { win: ruleSpan(v), min: v.atLeast }]));  // hours in rules.js
  const mealTomorrow = (k, n) => k !== 'late' && n.m > MEALS[k].win[1];
  const mealDay = (k, n, off) => (off != null ? off : mealTomorrow(k, n) ? 1 : 0);
  function mealOK(id, k, n, off = null) {
    const sp = spans(id, n);
    if (!sp) return false;
    const o = mealDay(k, n, off) * 1440, [a, b] = MEALS[k].win;
    return sp.some(([s, e]) => Math.min(e, b + o) - Math.max(s, a + o) >= MEALS[k].min);
  }
  function mealSpan(id, k, n, off = null) {  // the opening that covers the meal: {s, e, off (days ahead)}
    const sp = spans(id, n);
    if (!sp) return null;
    const dd = mealDay(k, n, off), o = dd * 1440, [a, b] = MEALS[k].win;
    const x = sp.find(([s, e]) => Math.min(e, b + o) - Math.max(s, a + o) >= MEALS[k].min);
    return x ? { s: x[0], e: x[1], off: dd } : null;
  }
  function dayHours(id, n, off) {  // a day's published opening, [[from, to] (minutes)]: [] closed, null not published
    const h = HOURS[id], t = h ? h[String((n.d + off) % 7)] : undefined;
    return t === undefined ? null : t === null ? [] : ranges(t);
  }


  const pickDate = (id) => picks[id] && new Date(picks[id].date + 'T12:00:00');
  const month = (id) => pickDate(id).toLocaleDateString(W.locale, { month: 'long', year: 'numeric' });

  // One place: is it open, until when, or when does it open. Each sentence comes from words.js as [shown, said].
  function one(p, n, q = {}, here = null) {
    const x = W.place(p);
    const out = { kind: 'one', id: p.id, ids: [p.id], say: [], show: '' };
    const said = (text) => out.say.push({ text: stop(text), id: p.id });
    const put = ([show, say]) => { out.show = show; said(say); };  // the answer's first sentence
    const add = ([show, say]) => { out.show += ' ' + show; said(say); };
    const susan = () => { if (picks[p.id]) said(W.susanWrote(month(p.id))); };
    // what Quiet shows instead of the voice: the same answer, with the times as the cards write them
    const done = () => {
      out.lines = [{ text: out.show, id: p.id }];
      if (picks[p.id] && !isSight(p)) out.lines.push({ text: W.susanWrote(month(p.id)) + '.', id: p.id });
      return out;
    };
    if (isSight(p)) { put(W.sight(x)); return done(); }
    // Google lists it as closed (photos/hours.json, 18 Nov 2026): say that, not hours that may be out of date
    if (STATUS[p.id]) { put(W.googleClosed(x, STATUS[p.id] === 'CLOSED_PERMANENTLY')); return done(); }
    const off = dayOff(q, n);
    if (off) {  // "Is Bocaciega open tomorrow?", "… on Sunday?"
      const day = (n.d + off) % 7, h = HOURS[p.id], t = h ? h[String(day)] : undefined, tmr = off === 1;
      put(t === undefined ? W.dayUnknown(x, day, tmr) : t === null ? W.dayClosed(x, day, tmr) : W.dayOpen(x, day, tmr, ranges(t)));
      susan(); return done();
    }
    const a = avail(p.id, n);
    if (q.howFar || q.near) {  // "How far is La Azotea?": the distance first, then whether it is open
      const og = origin(here), m = metres(og.o, p), km = m < 1000 ? `${Math.max(50, Math.round(m / 50) * 50)} m` : `${(m / 1000).toFixed(1)} km`;
      put(og.mine ? W.distMine(x, m, km) : og.far ? W.distFar(x, m, km) : W.distUnknown(x));
      if (!a) add(W.alsoNoHours());
      else if (openNow(a)) add(W.alsoOpen(x, a.until));
      else if (a.open) add(W.alsoClosesSoon(x, a.until));
      else if (a.at != null) add(W.alsoClosed(x, W.nextOpen(a, n)));
      susan(); return done();
    }
    if (!a) put(W.noHours(x));
    else if (openNow(a)) put(W.openNow(x, a.until));
    else if (a.open) put(W.closesSoon(x, a.until));
    else if (a.at != null) put(W.closedNow(x, a.closedToday, W.nextOpen(a, n)));
    else put(W.closedNoNext(x));
    if (q.price) { const t = W.price(F(p).p); out.show += ' ' + t + '.'; said(t); }  // "Is Fenicia cheap?": the price as facts.js has it
    susan(); return done();
  }

  const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Several kinds of place before several of one kind: Mexican, world food, a rooftop, a bar... each kind nearest the Jardín first.
  const KIND_ORDER = ['mex', 'world', 'roof', 'share', 'bfast', 'street', 'wine', 'shop'];
  const MORNING_ORDER = ['bfast', 'world', 'mex', 'street', 'share', 'roof', 'wine', 'shop'];  // breakfast: the cafés first
  function mixKinds(rows, order = KIND_ORDER) {
    const byKind = new Map(order.map((k) => [k, []]));
    for (const r of [...rows].sort((x, y) => dist(x.p) - dist(y.p))) (byKind.get(r.p.cat) || byKind.get('shop')).push(r);
    const out = [];
    for (let left = rows.length; left > 0;) for (const k of order) { const r = byKind.get(k).shift(); if (r) { out.push(r); left--; } }
    return out;
  }

  // Several places: filter, rank, and the first `count` of them.
  function list(q, n, here = null) {
    const topics = (q.topics || []).map((k) => TOPIC[k]);
    let pool = places.filter((p) => !isSight(p) && shown(p) && !STATUS[p.id]);  // not a place Google lists as closed (for good or for now)
    // a topic looks through every kind of place to eat and drink (and wine shops or wineries when it is about wine); otherwise the kinds asked for
    const want = new Set(topics.length ? [...EAT, ...topics.flatMap((t) => t.pool || [])] : q.cats || EAT);
    if (q.susan) want.add('wine');
    pool = pool.filter((p) => catsOf(p).some((c) => want.has(c)));
    if (q.picksOnly || (q.surprise && !topics.length)) pool = pool.filter((p) => !p.other);  // "four we recommend", "surprise me": our picks only
    const base = pool;  // before the where (Centro, an area) and who (Susan, unusual, local) filters
    const og = q.nearSight ? { o: byId[q.nearSight], sight: q.nearSight }
      : q.hotel && (q.hotel.ids.length || q.hotel.at) ? { o: q.hotel.ids.length ? byId[q.hotel.ids[0]] : q.hotel.at, sight: q.hotel.ids[0] || 'hotel', hotel: q.hotel }
      : q.near ? origin(here) : null;  // a hotel: nearest first from the place inside it, or from the hotel's own pin
    if (q.centro) pool = pool.filter(inCentro);
    if (q.area && !q.nearSight) pool = pool.filter((p) => { const a = fold(p.area + ' ' + ((INFO[p.id] || {}).address || '')); return a.includes(q.area) || (q.area === 'out of town' && a.includes('fuera de la ciudad')); });  // the Spanish page's areas are in Spanish
    // a street: the places on it; none of the kind asked for there: said so, and the others shown (as for an area); "in" a hotel with
    // none of its places on MapSMA: said so, and the nearest shown
    let streetMiss = !!(q.hotel && !q.hotel.ids.length && !q.hotel.near);  // "in Live Aqua": none on MapSMA inside it (said so); the nearest shown
    if (q.street) { const f = pool.filter((p) => STREETS.byId.get(p.id) === q.street.key); if (f.length || !pool.length) pool = f; else streetMiss = true; }
    if (q.susan) pool = pool.filter((p) => picks[p.id]);
    if (q.unique) pool = pool.filter((p) => F(p).x);
    if (q.local) pool = pool.filter(local);
    // the topics: every one must match, and their scores order the places. When nothing matches (Lars, 18 Nov 2026: "say here are four we
    // recommend approx what they want when we don't have a clear answer"): a topic the site has nowhere is said so, and its nearest topic
    // (pizza -> Italian food), or else the rest of the question, or else places we recommend, takes its place; a topic the site has, but
    // not there ("rooftops in Guadalupe"), is said so, and the ones elsewhere are shown.
    const score = new Map();
    let miss = null, whereMiss = streetMiss, recommend = false;
    if (topics.length) {
      const scoreAll = (ts, from = pool) => {
        const m = new Map();
        for (const p of from) { let sc = 0; for (const t of ts) { const x = topicScore(p, t); if (!x) { sc = 0; break; } sc += x; } if (sc) m.set(p.id, sc); }
        return m;
      };
      let m = scoreAll(topics);
      if (!m.size) {
        const gone = topics.find((t) => !base.some((p) => topicScore(p, t) > 0));
        if (gone) {
          const alt = gone.near ? TOPIC[gone.near] : null, rest = topics.filter((t) => t !== gone);
          miss = { topic: gone, alt };
          if (alt) { m = scoreAll([...rest, alt]); if (!m.size) m = scoreAll([alt]); }
          if (!m.size && rest.length) { m = scoreAll(rest); if (m.size) miss.alt = null; }
          if (!m.size) { m = new Map(pool.filter((p) => !p.other).map((p) => [p.id, 0.5])); miss.alt = null; recommend = true; }
        } else if ((m = scoreAll(topics, base)).size) { whereMiss = true; pool = base; }
      }
      pool = pool.filter((p) => m.has(p.id));
      for (const [id, sc] of m) score.set(id, sc);
    }
    // cafés: only when wanted (if leaving them out leaves nothing, they stay)
    if (!cafesWanted(q, n)) { const f = pool.filter((p) => !isCafe(p)); if (f.length) pool = f; }
    // the price: when nothing is at that price, say so and show the others
    let priceMiss = false;
    if (q.price) {
      const f = pool.filter(q.price === 'low' ? cheap : q.price === 'high' ? fancy : midPrice);
      if (f.length || !pool.length) pool = f; else priceMiss = true;
    }
    // a place whose name says the topic ("Sushi Gami" for sushi) comes first among equally good, equally open places
    const named = (p) => topics.some((t) => t.t && t.t.some((w) => (' ' + fold(p.name) + ' ').includes(' ' + w)));
    let rows = pool.map((p) => ({ p, a: avail(p.id, n), m: og ? metres(og.o, p) : null, s: score.get(p.id) || 0, nb: named(p) ? 1 : 0 }));
    const off = dayOff(q, n);
    if (q.meal) rows = rows.filter((r) => mealOK(r.p.id, q.meal, n, off));
    else if (off != null) rows = rows.filter((r) => (dayHours(r.p.id, n, off) || []).length);  // "open on Sunday"
    if (q.window != null) rows = rows.filter((r) => fits(r.a, q.window));
    const meal = q.meal || q.mealNow || (q.lateMeal === 'tonight' ? 'dinner' : q.lateMeal), morning = meal === 'bfast' || meal === 'brunch';  // breakfast: cafés and breakfast places before the rest
    if (morning) for (const r of rows) if (catsOf(r.p).includes('bfast') || (F(r.p).c || []).some((x) => ['breakfast', 'brunch', 'coffee', 'bakery'].includes(x))) { r.s += 0.5; r.mb = 1; }
    // a meal ("cheap eats", "lunch"): ice cream, coffee, bread and wine after the places that serve meals; for dinner, breakfast places too
    const meals = !morning && (q.eat || meal === 'lunch' || meal === 'dinner');
    const notMeal = ['ice_cream', 'coffee', 'bakery', 'desserts', 'pastries', 'wine', ...(meal === 'dinner' ? ['breakfast', 'brunch'] : [])];
    if (meals) for (const r of rows) if (notMeal.includes((F(r.p).c || [])[0]) || catsOf(r.p).some((c) => c === 'shop' || c === 'wine')) r.s -= 1;
    // a meal still ahead ("dinner tonight" asked in the morning): what is open at this moment does not matter
    const mw = q.meal && MEALS[q.meal] && q.meal !== 'late' ? MEALS[q.meal].win : null;
    const mealAhead = !!mw && !(mealDay(q.meal, n, off) === 0 && n.m >= mw[0] && n.m <= mw[1]);
    const byDate = (x, y) => pickDate(y.p.id) - pickDate(x.p.id);
    const soonest = (x, y) => (x.a && x.a.at != null ? x.a.at : 1e9) - (y.a && y.a.at != null ? y.a.at : 1e9);
    // our picks first, always; the extra places (not our picks) after them, each group ranked on its own (Lars, 18 Nov 2026: "We should
    // call out who we recommend")
    const rank = (rows) => {
      const nowRows = rows.filter((r) => openNow(r.a)), later = rows.filter((r) => !openNow(r.a));
      let ranked;
      if (q.susan) {
        const recent = (r) => n.date - pickDate(r.p.id) <= RECENT_DAYS * 864e5;
        const order = (g) => (q.surprise ? [...shuffle(g.filter(recent)), ...shuffle(g.filter((r) => !recent(r)))] : [...g].sort(byDate));
        ranked = [...order(nowRows), ...order(later)];
      } else if (q.surprise) ranked = [...shuffle(nowRows), ...shuffle(later)];
      else if (og && og.sight) ranked = [...rows].sort((x, y) => (y.mb || 0) - (x.mb || 0) || x.m - y.m);  // near a sight: the nearest first, open or not
      else if (og) { const byM = (x, y) => x.m - y.m; ranked = [...[...nowRows].sort(byM), ...[...later].sort(byM)]; }  // near me: what is open now, the nearest first
      else if (topics.length || q.priciest || q.price || q.local || (meals && q.unique)) {
        // the best match first (the priciest first when asked), then what is open now (nearest the Jardín first), then what opens soonest
        const pr = (r) => (q.priciest ? F(r.p).p || (fancy(r.p) ? 3 : 0) : 0), on = (r) => (mealAhead ? 0 : openNow(r.a));
        ranked = [...rows].sort((x, y) => pr(y) - pr(x) || y.s - x.s || on(y) - on(x) || y.nb - x.nb || (on(x) || mealAhead ? 0 : soonest(x, y)) || dist(x.p) - dist(y.p));
      } else if (meal) {
        // a meal: the places that serve it first, a mix of kinds, nearest the Jardín first; what is open now first only when it is that meal now
        const tiers = [...new Set(rows.map((r) => r.s))].sort((x, y) => y - x);
        const order = morning ? MORNING_ORDER : KIND_ORDER;
        ranked = tiers.flatMap((t) => { const g = rows.filter((r) => r.s === t); return mealAhead ? mixKinds(g, order) : [...mixKinds(g.filter((r) => openNow(r.a)), order), ...g.filter((r) => !openNow(r.a)).sort(soonest)]; });
      } else ranked = [...mixKinds(nowRows), ...[...later].sort(soonest)];
      return ranked;
    };
    const ranked = RULES.picksFirst ? [...rank(rows.filter((r) => !r.p.other)), ...rank(rows.filter((r) => r.p.other))] : rank(rows);
    return { rows: ranked, miss, priceMiss, whereMiss, recommend, pool, origin: og };
  }

  // The topics an answer is about (after a miss, the nearest topic in place of the missing one), and whether they say what kind of food:
  // then each place's name is enough; otherwise each name comes with what it is ("Fenicia, Lebanese food").
  const shownTopics = (q, ranked = {}) => (q.topics || []).map((k) => TOPIC[k]).map((t) => (ranked.miss && ranked.miss.topic === t ? ranked.miss.alt : t)).filter(Boolean);
  const kindAsked = (ts) => ts.some((t) => t.kind === 'cat' || t.kind === 'food');
  // the topics a phrase names: not brunch twice ("places for brunch open for brunch"), not "upscale places for fine dining"
  const phraseTopics = (q, ts) => ts.filter((t) => !((t.k === 'brunch' && q.meal === 'brunch') || (t.k === 'breakfast' && q.meal === 'bfast')));
  const phrasePrice = (q, ts) => (q.priceMiss || (q.price === 'high' && ts.some((t) => t.k === 'fine')) ? null : q.price);
  const ROOF_BARS = { noun: ['rooftop bars', 'rooftop bar'], nounEs: ['bares en azotea', 'bar en azotea', 'm'] };
  const catOf = (ts) => (ts.some((t) => t.k === 'rooftop') && ts.some((t) => t.k === 'bar') ? ROOF_BARS : ts.find((t) => t.noun));
  // what kind of places a list is about, as words.js phrases it: [plural, singular, gender] ("cheap places for Mexican food")
  const kindPhrase = (q, ts0) => {
    const ts = phraseTopics(q, ts0);
    return W.kind({ cat: catOf(ts), foods: ts.filter((t) => t.kind === 'food'), feats: ts.filter((t) => t.kind === 'feat'), price: phrasePrice(q, ts), local: q.local, unique: q.unique });
  };

  // Where ("in Centro", "near you"), what kind of places, and when: when(gender, one, digits) gives " open now or within the next two
  // hours" (Spanish agrees with the noun: "abiertos", "abierta"); digits: "2 hours", as the screen writes it.
  function describe(q, n, og = null, ranked = {}) {
    const where = (q.centro && !(og && og.sight === 'S2') ? W.inCentro : q.area === 'out of town' ? W.outOfTown : q.area && !(og && og.sight) ? W.inArea(q.area.replace(/\b\w/g, (c) => c.toUpperCase())) : '')
      + (q.street ? W.onStreet(q.street.name) : '') + (q.hotel && !q.hotel.ids.length && !q.hotel.near ? W.inArea(q.hotel[W.lang] || q.hotel.en) : '')
      + (og && !(og.hotel && q.hotel && !q.hotel.ids.length && !q.hotel.near) ? W.near(og, og.hotel ? og.hotel[W.lang] || og.hotel.en : og.sight ? sightName(og.sight) : null) : '');
    const ts = shownTopics(q, ranked);
    let kind = ts.length || q.price || q.local || q.unique ? kindPhrase({ ...q, priceMiss: ranked.priceMiss }, ts) : q.cats && q.cats.length === 1 ? W.kinds[q.cats[0]] || null : null;
    if ((q.unclear || ranked.recommend) && (!kind || kind[0] === W.places[0])) kind = W.recommended;
    const off = dayOff(q, n);
    const spec = q.lateMeal ? { late: q.lateMeal } : q.meal ? { meal: q.meal, day: mealDay(q.meal, n, off), noDay: q.meal === 'late' && off == null }
      : off != null ? { day: off } : q.window != null ? { window: q.window, now: q.now } : null;
    return { where, kind, ts, when: (g, one, digits) => (spec ? W.when(spec, n, g, one, digits) : '') };
  }

  // A list answer: what could not be found, how many of what ("Here are four places in Centro that are open now"), then each place.
  function listAnswer(q, n, ranked, offset, count) {
    const page = ranked.rows.slice(offset, offset + count), total = ranked.rows.length;
    const og = ranked.origin || null;
    const elsewhere = { ...q, centro: false, area: null, street: null, hotel: null, unique: false, local: false, susan: false };  // "rooftops in Guadalupe": none there, the ones elsewhere (a hotel with none: Centro)
    const d = describe(ranked.whereMiss ? elsewhere : q, n, ranked.whereMiss && !(og && og.hotel) ? null : og, ranked), k = page.length, asked = q.count || 0;  // "only" when a number was asked for
    const out = { kind: 'list', q, ids: page.map((r) => r.p.id), all: ranked.rows.map((r) => r.p.id), offset, count, left: Math.max(0, total - offset - k), say: [], lines: [], show: '', susan: q.susan,
      here: ranked.here || null, dist: og ? Object.fromEntries(page.map((r) => [r.p.id, r.m])) : null, mine: !!(og && og.mine) };
    const said = (text, id) => out.say.push({ text: stop(text.replace(/\s+/g, ' ').trim()), id });
    const line = (text, id) => out.lines.push({ text, id });  // what Quiet shows instead of the voice
    const both = (text) => { said(text); line(text + '.'); };
    const notes = [], note = (text) => { both(text); notes.push(text + '.'); };  // what could not be found also leads the written answer
    const [pl, sg, g0] = d.kind || W.places;
    const labels = !kindAsked(d.ts), lab = (r) => (labels ? W.label(F(r.p), q.unique) : '');  // what each place is, when the question did not say
    if (offset === 0 && ranked.miss) note(W.miss(ranked.miss.topic));
    if (offset === 0 && ranked.priceMiss) note(W.priceMiss(q.price, g0));
    if (offset === 0 && ranked.whereMiss) { const d0 = describe(q, n, og, {}); note(W.foundNo((d0.kind || W.places)[0], d0.where)); }
    if (offset === 0 && q.unclear) note(W.unclear());
    if (og && !og.mine && !og.sight && offset === 0) both(W.measured(og.far));  // "near me" without a location in San Miguel
    if (q.local && offset === 0 && k) both(W.localNote());
    if (!k) {
      if (offset > 0) { out.show = W.allDone() + '.'; said(W.allDone()); line(out.show); return out; }
      if (ranked.miss && !ranked.pool.length) { out.show = out.lines.map((l) => l.text).join(' '); return out; }  // "I couldn't find Indian food" says it all
      // "None of the places that are good with children is open for breakfast tomorrow."; "Nothing in Centro among Susan York's picks matches."
      const [show, say] = d.kind && !q.susan ? W.noneOf(d.kind, d.where, d.when) : W.nothing(d.where, q.susan ? W.amongSusan : '', d.when);
      out.show = show; said(say);
      line(out.show);
      if (notes.length) out.show = notes.join(' ') + ' ' + out.show;
      if (d.when('m', true, false)) {  // when the time rules everything out: the first of them to open
        const firsts = ranked.pool.map((p) => ({ p, a: avail(p.id, n) })).filter((r) => r.a && r.a.at != null).sort((x, y) => x.a.at - y.a.at);
        if (firsts.length) { const f = firsts[0], [fs, fv] = W.firstToOpen(W.place(f.p), W.nextOpen(f.a, n)); out.ids = [f.p.id]; said(fv, f.p.id); out.show += ' ' + fs; line(fs); }
      }
      return out;
    }
    const allRecent = page.every((r) => !picks[r.p.id] || n.date - pickDate(r.p.id) <= RECENT_DAYS * 864e5);
    // our picks and the extra places on this page: when both are here, each of our picks is marked (20 Nov 2026: "mark our selection 'our pick'")
    const ours = page.filter((r) => !r.p.other).length, theirs = k - ours;
    out.mixed = !!(ours && theirs);
    const fav = q.best && !q.susan && !theirs && (W.favWithPrice || !q.price);  // every place here is a favourite: "the best Italian" gets "our favourite places for Italian food"
    const [show, say] = W.listHead({ k, offset, asked, susan: q.susan, surprise: q.surprise, fav, recent: allRecent, pl, thing: k === 1 ? sg : pl, g0, where: d.where, when: d.when, priciest: q.priciest });
    said(say);
    out.show = show;
    line(out.show);
    if (notes.length) out.show = notes.join(' ') + ' ' + out.show;
    const off = dayOff(q, n);
    for (const r of page) {
      const x = W.place(r.p), a = r.a, meal = q.meal && mealSpan(r.p.id, q.meal, n, off);
      const far = r.m != null ? { say: `, ${W.sayDist(r.m)}`, show: `${W.showDist(r.m)} · ` } : { say: '', show: '' };  // near me: how far
      const l = lab(r), mk = theirs && !r.p.other && !isSight(r.p), ls = (l ? `, ${l}` : '') + (mk ? W.opSay : ''), lw = (mk ? W.opShow : '') + (l ? `${l} · ` : '');
      const dh = !q.meal && off != null ? dayHours(r.p.id, n, off) : null;  // "open on Sunday": that day's hours
      const [s, v] = meal ? W.rowSpans(W.dayWords(meal.off, n), [[meal.s, meal.e]]) : dh && dh.length ? W.rowSpans(W.dayWords(off, n), dh)
        : openNow(a) ? W.rowOpen(x, a.until) : a && a.at != null ? W.rowOpens(W.nextOpen(a, n)) : [a ? W.rowClosed(x) : W.rowNoHours(), ''];
      said(`${x.sn}${ls}${far.say}${v ? ', ' + v : ''}`, r.p.id); line(`${lw}${far.show}${s}`, r.p.id);
    }
    return out;
  }

  // The answer to a question: {kind: 'list'|'one'|'none', ids, say: [{text, id?}], show}. `last` is the previous list, for "4 more".
  // Reading (read.js) turns the words into a request; answerRequest() answers a request, whoever wrote it (Lars, 18 Nov 2026: "Do 1-3
  // proposal", 2: reading the question apart from finding the answer).
  // streets from the addresses; hotels: the places inside them (owner, 22 Nov 2026: "show me restaurants in Live Aqua"). Live Aqua
  // (Calzada de la Presa 85, Zona Centro) has none on MapSMA yet: "in Live Aqua" says so and shows the nearest; "near Live Aqua" the
  // nearest from its pin (Google Maps, the owner's link, 22 Nov 2026).
  const STREETS = streetIndex(places.map((p) => ({ id: p.id, address: (INFO[p.id] || {}).address })));
  const HOTELS = [
    { words: 'live aqua', en: 'Live Aqua', es: 'Live Aqua', ids: [], at: { lat: 20.919975, lng: -100.739347 } },
    { words: 'rosewood', en: 'the Rosewood', es: 'el Rosewood', ids: ['62'] },  // Luna Rooftop
    { words: 'belmond|casa de sierra nevada|sierra nevada', en: 'the Belmond', es: 'el Belmond', ids: ['42'] },  // Andanza
    { words: 'casa blanca (7|siete)|casa blanca', en: 'Casa Blanca 7', es: 'Casa Blanca 7', ids: ['X14'] },  // Fátima 7 Rooftop
    { words: 'golpe de vista', en: 'El Golpe de Vista', es: 'El Golpe de Vista', ids: ['X15'] },  // Terraza La Vista
  ].map((h) => ({ ...h, ids: h.ids.filter((id) => byId[id]) }));
  const reader = createReader({ places, MEALS, streets: STREETS, hotels: HOTELS });
  function answer(text, n, last = null, here = null) { return answerRequest(reader.read(text, n), n, last, here); }
  function answerRequest(q, n, last = null, here = null) {
    if (q.more && last && last.kind === 'list') {
      const ranked = { ...list(last.q, n, last.here), here: last.here }, count = q.count || last.count || RULES.listCount, offset = last.offset + last.ids.length;
      return listAnswer(last.q, n, ranked, offset, count);
    }
    const named = q.named ? byId[q.named.id] : null;
    if (named && !q.wantsList) return { ...one(named, n, q, here), q };
    // "Is … open?" about one place whose name was not caught: say so, and offer the closest names, rather than a list of other places
    // (q.soundNear: the names by sound were close, so the page asks between them, index.html bySound)
    const onePlace = (q.soundNear && q.soundNear.length) || ((/^(is|are|when|what time|does|do|how late|until when|till when|tell me about|how about|what about|esta|estan|a que hora|cuando|abre|cierra|hasta que hora|que tal|donde esta|como llego)\b/.test(q.s) || q.howFar) && !q.wantsList && !q.near && !q.centro && !q.area && !q.street && !q.hotel && !q.cats && !q.asks && !q.nearSight);
    if (onePlace) {
      const near = (q.nearNames || []).map((id) => byId[id]).filter((p) => p && shown(p));
      const [show, say] = W.didntCatch(near.map((p) => W.place(p).sn));
      return { kind: 'none', q, ids: [], near: near.map((p) => p.id), say: [{ text: say }], show, lines: [{ text: show }] };
    }
    if (q.wantsList || q.asks || q.near || q.nearSight || q.centro || q.area || q.street || q.hotel || q.cats || q.window != null || q.dayIdx != null) {
      const count = q.count || (q.susan ? RULES.susanCount : RULES.listCount);
      return listAnswer(q, n, { ...list(q, n, here), here }, 0, count);
    }
    // a word search, as the search box on /page2 does
    const words = q.rest.split(' ').filter((w) => w.length >= 4 && !/^(what|where|when|which|about|there|place|please|tell|show|find|good|best|some|with|from|that|this|have|open|donde|cuando|lugar|lugares|esta|estan|abierto|abierta|para|comer|beber|quiero|busco|tienen|tiene|algun|alguna|buen|buena|mejor|mejores|cerca|hora|horas|ahora|aqui|algo|como|cual|cuales|sitio|sitios)$/.test(w));
    const found = words.length ? places.filter((p) => shown(p) && !STATUS[p.id] && words.some((w) => fold([p.name, p.area, p.desc, (CATS[p.cat] || {}).label, (INFO[p.id] || {}).address].join(' ')).includes(w))) : [];
    if (found.length) {
      const rows = found.map((p) => ({ p, a: avail(p.id, n) }));
      return listAnswer({ ...q, window: null }, n, { rows: [...rows.filter((r) => openNow(r.a)), ...rows.filter((r) => !openNow(r.a))], pool: found }, 0, 4);
    }
    // not understood: four places we recommend that are open now (any time, when none is), not "Sorry" (Lars, 18 Nov 2026)
    let uq = { ...q, unclear: true, picksOnly: true, window: SOON, now: true, best: false, topics: [], cats: null }, ur = list(uq, n, here);
    if (!ur.rows.length) { uq = { ...uq, window: null, now: false }; ur = list(uq, n, here); }
    return listAnswer(uq, n, { ...ur, here }, 0, q.count || RULES.listCount);
  }

  return { answer, answerRequest, read: reader.read, parse, matchPlace: reader.matchPlace, avail, openNow, inCentro, dist, picks, spans, shown };
}
