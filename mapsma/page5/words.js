// MapSMA /page5 (Ask by voice): the words of the answers, English and Spanish, in one place (Lars, 18 Nov 2026: "Do 4-7"; 7 = one
// wording system for both languages). ask.js decides what to answer: which places, open or not, what could not be found. WORDS.en and
// WORDS.es say it, each in its own grammar (Spanish agrees with the noun: "lugares abiertos", "terrazas abiertas", "La Azotea está
// abierta"). Most sentences come as [shown, said]: what the screen (and Quiet) shows, with times as the cards write them (22:00) and
// names as written, and what the voice says ("10 p.m.", names as the voice can read them).
// A third language would be a third table here. The topic words ("Italian food", "comida italiana") stay with the topics in read.js,
// which reads questions in both languages.
import { RULES } from './rules.js?v=20261118f';

// ---------- times, numbers and distances ----------
export const DAYNAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const day0 = (m) => ((m % 1440) + 1440) % 1440;
// A time as the cards show it (22:00, 1:00) and as the voice says it (10 p.m., 1 a.m., noon, midnight).
export const clock = (m) => { m = day0(m); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
const until = (m) => (day0(m) === 0 ? 'midnight' : clock(m));  // in a sentence: "until midnight", not "until 0:00"
export function sayTime(m) {
  m = day0(m);
  if (m === 0) return 'midnight';
  if (m === 720) return 'noon';
  const h = Math.floor(m / 60), mm = m % 60, h12 = h % 12 || 12, ap = h < 12 ? 'a.m.' : 'p.m.';
  return mm ? `${h12}:${String(mm).padStart(2, '0')} ${ap}` : `${h12} ${ap}`;
}
const NUMS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
export const sayNum = (n) => NUMS[n] || String(n);
// Spanish (Lars, 17 Nov 2026: "Yes build that way - with phones output for Spanish and a language switch EN ES")
const NUM_ES = ['ningún', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
export const sayNumEs = (n, fem) => (n === 1 ? (fem ? 'una' : 'un') : NUM_ES[n] || String(n));
// A time as the phone's Spanish voice says it: "la medianoche", "el mediodía", "la 1 de la tarde", "las 10 y media de la noche".
export function sayTimeEs(m) {
  m = day0(m);
  if (m === 0) return 'la medianoche';
  if (m === 720) return 'el mediodía';
  const h = Math.floor(m / 60), mm = m % 60, h12 = h % 12 || 12;
  const part = h < 1 ? 'de la noche' : h < 6 ? 'de la madrugada' : h < 12 ? 'de la mañana' : h < 19 ? 'de la tarde' : 'de la noche';  // 0:30 is still "de la noche"
  const mins = mm === 0 ? '' : mm === 30 ? ' y media' : mm === 15 ? ' y cuarto' : ` y ${mm}`;
  return `${h12 === 1 ? 'la' : 'las'} ${h12}${mins} ${part}`;
}
export const aTimeEs = (m) => { const t = sayTimeEs(m); return t.startsWith('el ') ? 'al ' + t.slice(3) : 'a ' + t; };  // "a la 1 de la tarde", "al mediodía"
const deTimeEs = (m) => { const t = sayTimeEs(m); return t.startsWith('el ') ? 'del ' + t.slice(3) : 'de ' + t; };  // "del mediodía", "de la 1 de la tarde"
const rangeEs = (a, b) => `${deTimeEs(a)} ${aTimeEs(b)}`;  // "del mediodía a la medianoche"
// On screen: "las 22:00", "la 1:00", "la medianoche".
export const showTimeEs = (m) => { m = day0(m); if (m === 0) return 'la medianoche'; const c = clock(m); return (/^1:/.test(c) ? 'la ' : 'las ') + c; };
const untilEs = (m) => (day0(m) === 0 ? 'medianoche' : clock(m));
const round50 = (m) => Math.max(50, Math.round(m / 50) * 50);
export const walkMin = (m) => Math.max(1, Math.round(m / RULES.walkMetresPerMinute));
const walkEs = (m) => (walkMin(m) === 1 ? 'un minuto' : `unos ${walkMin(m)} minutos`);
// How far a place is, for the voice and for the cards ("about 350 meters away", "350 m · 5 min walk").
export const sayDist = (m) => (m < 1000 ? `about ${round50(m)} meters away` : `about ${(m / 1000).toFixed(1)} kilometers away`);
export const showDist = (m) => `${m < 1000 ? round50(m) + ' m' : (m / 1000).toFixed(1) + ' km'} · ${walkMin(m)} min walk`;
export const sayDistEs = (m) => (m < 1000 ? `a unos ${round50(m)} metros` : `a unos ${(m / 1000).toFixed(1)} kilómetros`);
export const showDistEs = (m) => `${m < 1000 ? round50(m) + ' m' : (m / 1000).toFixed(1) + ' km'} · ${walkMin(m)} min a pie`;
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
// A name for the English voice: no accents or apostrophes inside words (tiny-voca reads English), "&" as "and".
// How a few names are spelled for the voice, which reads English ("Hierba" came out as "here Ba"): the English spelling people use.
const SAY_AS = {};  // was {'Hierba Santa': 'Yerba Santa'}; since 17 Nov the voice is taught Spanish pronunciations (spanish.js) instead
// "y" (and) between two words of a name is written "e" for the voice: alone, "y" is read as the letter ("why"), and the letter "e" is
// read "ee", the sound of the Spanish "y" (Arriba y Abajo).
export const sayName = (s) => String(SAY_AS[s] || s || '').replace(/(\p{L}) y (?=\p{L})/gu, '$1 e ').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'and').replace(/(\w)'(?!s\b)(\w)/g, '$1$2').replace(/\s+/g, ' ').trim();

// The sights a question can be near ("lunch near the Parroquia"), as a sentence names them: [English, Spanish].
const SIGHTS = { S1: ['the Parroquia', 'la Parroquia'], S2: ['the Jardín', 'el Jardín'], S3: ['the Casa de Allende museum', 'el Museo Casa de Allende'], S4: ['Bellas Artes', 'Bellas Artes'],
  S5: ['the Concepción church', 'el templo de la Concepción'], S6: ['the public library', 'la Biblioteca Pública'], S7: ['the San Francisco church', 'el templo de San Francisco'], S8: ['the Oratorio', 'el Oratorio'],
  S9: ['the craft market', 'el Mercado de Artesanías'], S10: ['Parque Juárez', 'el Parque Juárez'], S11: ['the bullring', 'la Plaza de Toros'], S12: ['the Instituto Allende', 'el Instituto Allende'],
  S13: ['El Mirador', 'El Mirador'], S14: ['El Charco del Ingenio', 'El Charco del Ingenio'], S15: ['Fábrica La Aurora', 'la Fábrica La Aurora'], S16: ['Atotonilco', 'Atotonilco'] };

// The parts of a time a list is about (ask.js, describe()): {late: meal | 'tonight'}, {meal, day, noDay}, {day}, or {window, now}.
// when(spec, n, g, one, digits): " open now or within the next two hours"; Spanish agrees with the noun's gender g and number (one);
// digits: "2 hours" (the screen) instead of "two hours" (the voice).

// ---------- English ----------
const dayWords = (k, n) => (k === 0 ? 'today' : k === 1 ? 'tomorrow' : `on ${DAYNAMES[(n.d + k) % 7]}`);
const MEAL = { bfast: 'breakfast', brunch: 'brunch', lunch: 'lunch', dinner: 'dinner', late: 'late at night' };
const oneVerb = (s) => s.replace(/^places\b/, 'place').replace(' that welcome ', ' that welcomes ').replace(' that are ', ' that is ').replace(' that take ', ' that takes ');
const spansEn = (sp) => [sp.map(([x, y]) => `${clock(x)}–${until(y)}`).join(', '), sp.map(([x, y]) => `${sayTime(x)} to ${sayTime(y)}`).join(', and from ')];
const EN = {
  locale: 'en-US',
  place: (p) => ({ name: p.name, sn: sayName(p.name), o: 'o' }),  // the name as written, as the voice reads it
  sightName: (id) => SIGHTS[id] && SIGHTS[id][0],
  dayWords,
  nextOpen(a, n) {  // "today at 1 p.m.", "tomorrow at noon", "on Thursday at 8 a.m."
    const k = Math.floor(a.at / 1440), t = sayTime(a.at), c = clock(a.at);
    if (k <= 0) return { say: `today at ${t}`, show: `today at ${c}` };
    if (k === 1) return { say: `tomorrow at ${t}`, show: `tomorrow at ${c}` };
    const day = DAYNAMES[(n.d + k) % 7];
    return { say: `on ${day} at ${t}`, show: `on ${day} at ${c}` };
  },

  // one place: is it open, until when, or when does it open
  sight: (x) => [`${x.name} is a sight, not a place to eat.`, `${x.sn} is a sight, not a place to eat. Here it is`],
  googleClosed: (x, gone) => (gone ? [`Google lists ${x.name} as permanently closed.`, `Google lists ${x.sn} as permanently closed`]
    : [`Google lists ${x.name} as temporarily closed. Check Google Maps before you go.`, `Google lists ${x.sn} as temporarily closed. Check Google Maps before you go`]),
  dayUnknown: (x, day, tmr) => { const d = tmr ? 'tomorrow' : DAYNAMES[day]; return [`${x.name}'s hours for ${d} aren't published online. Check Google Maps.`, `I don't have ${x.sn}'s hours for ${d}. Check Google Maps`]; },
  dayClosed: (x, day, tmr) => { const on = tmr ? 'tomorrow' : `on ${DAYNAMES[day]}`; return [`${x.name} is closed ${on}${tmr ? ` (${DAYNAMES[day]})` : ''}.`, `${x.sn} is closed ${on}`]; },
  dayOpen: (x, day, tmr, rs) => [`${tmr ? `Tomorrow (${DAYNAMES[day]})` : `On ${DAYNAMES[day]}`} ${x.name} is open ${rs.map(([a, b]) => `${clock(a)}–${until(b)}`).join(' and ')}.`,
    `Yes. ${tmr ? 'Tomorrow' : `On ${DAYNAMES[day]}`} ${x.sn} is open from ${rs.map(([a, b]) => `${sayTime(a)} to ${sayTime(b)}`).join(', and from ')}`],
  distMine: (x, m, km) => [`${x.name} is ${km} from you, about ${walkMin(m)} min on foot.`, `${x.sn} is ${sayDist(m).replace(' away', '')} from you, about ${walkMin(m)} minutes' walk`],
  distFar: (x, m, km) => [`You don't seem to be in San Miguel right now. From the Jardín, ${x.name} is ${km} away.`, `You don't seem to be in San Miguel right now. From the Jardín, ${x.sn} is ${sayDist(m)}`],
  distUnknown: (x) => [`I don't know where you are, so I can't tell how far ${x.name} is.`, `I don't know where you are, so I can't tell how far ${x.sn} is`],
  alsoNoHours: () => ["Its opening hours aren't published online.", "Its opening hours aren't published online"],  // after the distance
  alsoOpen: (x, t) => [`It's open now, until ${until(t)}.`, `It's open now, until ${sayTime(t)}`],
  alsoClosesSoon: (x, t) => [`It closes soon, at ${until(t)}.`, `It closes soon, at ${sayTime(t)}`],
  alsoClosed: (x, w) => [`It's closed now; it opens ${w.show}.`, `It's closed now. It opens ${w.say}`],
  noHours: (x) => [`${x.name}'s opening hours aren't published online. Check Google Maps.`, `I don't have opening hours for ${x.sn}. Check Google Maps`],
  openNow: (x, t) => [`Yes, ${x.name} is open now, until ${until(t)}.`, `Yes. ${x.sn} is open now, until ${sayTime(t)}`],
  closesSoon: (x, t) => [`${x.name} is open, but closes soon, at ${until(t)}.`, `${x.sn} is open, but it closes soon, at ${sayTime(t)}`],
  closedNow: (x, today, w) => { const why = today ? 'closed today' : 'closed right now'; return [`No, ${x.name} is ${why}. It opens ${w.show}.`, `No. ${x.sn} is ${why}. It opens ${w.say}`]; },
  closedNoNext: (x) => [`No, ${x.name} is closed, and its next opening isn't listed.`, `No. ${x.sn} is closed, and I don't know when it opens next`],
  price: (v) => (v == null ? "I don't know its prices"  // facts.js: 1 cheap … 4 very expensive
    : ['', "It's one of the cheaper places on our list", 'Its prices are moderate', "It's one of the pricier places on our list", "It's one of the most expensive places on our list"][v]),
  susanWrote: (month) => `Susan York wrote about it in ${month}`,
  didntCatch(names) {  // "Is … open?" about a place whose name was not caught
    const joined = names.length > 1 ? names.slice(0, -1).join(', ') + ', or ' + names[names.length - 1] : names[0];
    return names.length ? ["I didn't catch the place's name. Did you mean:", `I didn't catch the name of the place. Did you mean ${joined}?`]
      : ["I didn't catch the place's name. Please say it again, or type it.", "I didn't catch the name of the place. Please say it again, or type it."];
  },

  // what a list is about: [plural, singular] ("cheap places for Mexican food", "rooftops with a view", "places to watch the sunset")
  places: ['places', 'place'],
  recommended: ['places we recommend', 'place we recommend'],
  kinds: { bfast: ['cafés', 'café'], mex: ['Mexican places', 'Mexican place'], world: ['world-food places', 'world-food place'], street: ['street-food places', 'street-food place'],
    share: ['bars', 'bar'], roof: ['rooftops', 'rooftop'], wine: ['wineries', 'winery'] },
  kind({ cat, foods, feats, price, local, unique }) {
    if (!cat && !foods.length && feats.length === 1 && !price && !local && !unique) return [feats[0].en, oneVerb(feats[0].en)];
    let [pl, sg] = cat ? cat.noun : ['places', 'place'];
    if (local) [pl, sg] = ['everyday local places', 'everyday local place'];
    if (unique) [pl, sg] = ['unusual places', 'unusual place'];
    const adj = price === 'low' ? 'cheap ' : price === 'high' ? 'upscale ' : price === 'mid' ? 'moderately priced ' : '';
    const trad = foods.find((t) => t.k === 'tradmex'), other = foods.filter((t) => t.k !== 'tradmex');
    const food = foods.length ? ` for ${trad && other.length ? 'traditional ' + other[0].en : (other[0] || trad).en}` : '';
    const withs = feats.map((t) => t.with).join(' and');
    return [adj + pl + food + withs, adj + sg + food + oneVerb(withs)];
  },
  label: (f, unique) => (unique && f.u) || f.w || '',  // what each place is, when the question did not say (facts.js)
  inCentro: ' in Centro', outOfTown: ' out of town', inArea: (a) => ` in ${a}`, onStreet: (s) => ` on ${s}`, lang: 'en',
  near: (og, sight) => (og.sight ? ` near ${sight}` : og.mine ? ' near you' : ' near the Jardín'),
  when(s, n, g, one, digits) {
    if (s.late) return s.late === 'tonight' ? ' open now' : ` open now for a late ${MEAL[s.late]}`;
    if (s.meal) return ` open for ${MEAL[s.meal]}${s.noDay ? '' : ' ' + dayWords(s.day, n)}`;
    if (s.day != null) return ` open ${dayWords(s.day, n)}`;
    const h = s.window % 60 === 0 ? s.window / 60 : null, span = h === 1 ? 'hour' : h ? `${digits ? h : sayNum(h)} hours` : `${s.window} minutes`;
    return s.now ? ` open now or within the next ${span}` : ` open in the next ${span}`;
  },

  // a list: what could not be found leads, then how many of what, then each place
  miss: (t) => `I couldn't find ${t.en || t.noun[0]} on this site's list`,
  priceMiss: (price) => `I don't know of any ${{ low: 'cheap', high: 'upscale', mid: 'moderately priced' }[price]} ones, so here are all of them`,
  foundNo: (kind, where) => `I found no ${kind}${where}`,
  unclear: () => "I'm not sure what you're looking for",
  measured: (far) => (far ? "You don't seem to be in San Miguel right now, so I measured from the Jardín" : "I don't know where you are, so I measured from the Jardín"),
  localNote: () => 'Every place on this site is picked by people who live in San Miguel',
  allDone: () => 'That was all of them',
  amongSusan: " among Susan York's picks",
  noneOf(kind, where, when) {  // "None of the places that are good with children is open for breakfast tomorrow."
    const w = when('m', true, false), ws = when('m', true, true), none = w ? `None of the ${kind[0]}${where} is${w}` : `I found no ${kind[0]}${where}`;
    return [(w ? `None of the ${kind[0]}${where} is${ws}` : none) + '.', none];
  },
  nothing(where, among, when) {
    const w = when('m', true, false), ws = when('m', true, true);
    return [`Nothing${where}${among}${ws ? ' is' + ws : ' matches'}.`, `I found nothing${where}${among}${w ? ' that is' + w : ''}`];
  },
  firstToOpen: (x, w) => [`The first to open is ${x.name}, ${w.show}.`, `The first to open is ${x.sn}, ${w.say}`],
  favWithPrice: true,  // "our favourite cheap places for tacos"
  // "Here are four places in Centro", "three of Susan York's recent picks", "two of our favourite places for Peruvian food"
  listHead({ k, offset, asked, susan, surprise, fav, recent, pl, thing, where, when, priciest }) {
    const w = when('m', k === 1, false), ws = when('m', k === 1, true);
    const subject = (num) => (susan ? `${num} of Susan York's ${recent ? 'recent ' : ''}picks` : fav ? `${num} of our favourite ${pl}` : `${num} ${thing}`) + where;
    const that = w ? ` that ${k === 1 ? 'is' : 'are'}${w}` : '';
    const order = priciest && k > 1 ? ', the most expensive first' : '';
    const say = offset > 0 ? `${cap(sayNum(k))} more ${susan ? `of Susan York's picks${where}` : `${thing}${where}`}${that}`
      : k < asked ? `I found only ${subject(sayNum(k))}${that}${order}`
        : surprise ? `Here's a surprise: ${subject(sayNum(k))}${that}`
          : `Here ${k === 1 ? 'is' : 'are'} ${subject(sayNum(k))}${that}${order}`;
    const num = offset > 0 ? `${k} more` : k < asked ? `Only ${k}` : String(k);
    const what = fav && offset === 0 && !(k < asked) ? `${num} of our favourite ${pl}` : `${num} ${thing}`;
    return [cap(`${susan ? `${num} of Susan York's ${recent ? 'recent ' : ''}picks${where}${ws ? ',' : ''}` : `${what}${where}`}${ws}${offset === 0 ? order : ''}.`), say];
  },
  opSay: ', one of our picks', opShow: '★ our pick · ',  // one of our picks, on a page with extra places too (20 Nov 2026)
  sayDist, showDist,
  rowSpans: (dw, sp) => { const [s, v] = spansEn(sp); return [`${dw} ${s}`, `${dw} from ${v}`]; },  // "today from 1 p.m. to 10 p.m."
  rowOpen: (x, t) => [`open until ${until(t)}`, `open until ${sayTime(t)}`],
  rowOpens: (w) => [`opens ${w.show.replace(/^today /, '')}`, `opening ${w.say.replace(/^today /, '')}`],
  rowClosed: () => 'closed', rowNoHours: () => 'hours not published',
};

// ---------- Spanish ----------
const dayWordsEs = (k, n) => (k === 0 ? 'hoy' : k === 1 ? 'mañana' : `el ${DIAS[(n.d + k) % 7]}`);
const LATE_ES = { bfast: 'un desayuno tardío', brunch: 'un brunch tardío', lunch: 'una comida tardía', dinner: 'una cena tardía' };
const MEAL_ES = { bfast: 'desayunar', brunch: 'el brunch', lunch: 'comer', dinner: 'cenar' };
const ins = (s, w) => (w ? s.replace(/^(\S+)/, `$1${w}`) : s);  // a word after the noun: "lugares baratos para comida mexicana"
const ES = {
  locale: 'es-MX',
  // the phone's Spanish voice reads the name as written, accents and all; o: abierto / abierta (La Azotea, but El Rinconcito, Bocaciega)
  place: (p) => ({ name: p.name, sn: p.name.replace(/&/g, 'y'), o: /^(la|las)\s/i.test(p.name) ? 'a' : 'o' }),
  sightName: (id) => SIGHTS[id] && SIGHTS[id][1],
  dayWords: dayWordsEs,
  nextOpen(a, n) {  // "hoy a la 1 de la tarde", "mañana al mediodía", "el jueves a las 8 de la mañana"
    const k = Math.floor(a.at / 1440), when = k <= 0 ? 'hoy' : k === 1 ? 'mañana' : `el ${DIAS[(n.d + k) % 7]}`;
    return { say: `${when} ${aTimeEs(a.at)}`, show: `${when} a ${showTimeEs(a.at)}` };
  },

  sight: (x) => [`${x.name} es un lugar para visitar, no para comer.`, `${x.sn} es un lugar para visitar, no para comer. Aquí está`],
  googleClosed: (x, gone) => (gone ? [`Google indica que ${x.name} cerró definitivamente.`, `Google indica que ${x.sn} cerró definitivamente`]
    : [`Google indica que ${x.name} está cerrad${x.o} por ahora. Consulta Google Maps antes de ir.`, `Google indica que ${x.sn} está cerrad${x.o} por ahora. Consulta Google Maps antes de ir`]),
  dayUnknown: (x, day, tmr) => (tmr ? [`El horario de mañana de ${x.name} no está publicado en internet. Consulta Google Maps.`, `No tengo el horario de mañana de ${x.sn}. Consulta Google Maps`]
    : [`El horario de ${x.name} para el ${DIAS[day]} no está publicado en internet. Consulta Google Maps.`, `No tengo el horario de ${x.sn} para el ${DIAS[day]}. Consulta Google Maps`]),
  dayClosed: (x, day, tmr) => [`${x.name} está cerrad${x.o} ${tmr ? `mañana (${DIAS[day]})` : `el ${DIAS[day]}`}.`, `${x.sn} está cerrad${x.o} ${tmr ? 'mañana' : `el ${DIAS[day]}`}`],
  dayOpen: (x, day, tmr, rs) => [`${tmr ? `Mañana (${DIAS[day]})` : `El ${DIAS[day]}`} ${x.name} abre ${rs.map(([a, b]) => `de ${clock(a)} a ${untilEs(b)}`).join(' y ')}.`,
    `Sí. ${tmr ? 'Mañana' : `El ${DIAS[day]}`} ${x.sn} abre ${rs.map(([a, b]) => rangeEs(a, b)).join(', y ')}`],
  distMine: (x, m, km) => [`${x.name} está a ${km} de ti, ${walkMin(m) === 1 ? '1 min' : `unos ${walkMin(m)} min`} a pie.`, `${x.sn} está ${sayDistEs(m)} de ti, ${walkEs(m)} a pie`],
  distFar: (x, m, km) => [`No parece que estés en San Miguel ahora. Desde el Jardín, ${x.name} está a ${km}.`, `No parece que estés en San Miguel ahora. Desde el Jardín, ${x.sn} está ${sayDistEs(m)}`],
  distUnknown: (x) => [`No sé dónde estás, así que no puedo decir qué tan lejos está ${x.name}.`, `No sé dónde estás, así que no puedo decir qué tan lejos está ${x.sn}`],
  alsoNoHours: () => ['Su horario no está publicado en internet.', 'Su horario no está publicado en internet'],
  alsoOpen: (x, t) => [`Está abiert${x.o} ahora, hasta ${showTimeEs(t)}.`, `Está abiert${x.o} ahora, hasta ${sayTimeEs(t)}`],
  alsoClosesSoon: (x, t) => [`Cierra pronto, a ${showTimeEs(t)}.`, `Cierra pronto, ${aTimeEs(t)}`],
  alsoClosed: (x, w) => [`Ahora está cerrad${x.o}; abre ${w.show}.`, `Ahora está cerrad${x.o}. Abre ${w.say}`],
  noHours: (x) => [`El horario de ${x.name} no está publicado en internet. Consulta Google Maps.`, `No tengo el horario de ${x.sn}. Consulta Google Maps`],
  openNow: (x, t) => [`Sí, ${x.name} está abiert${x.o} ahora, hasta ${showTimeEs(t)}.`, `Sí. ${x.sn} está abiert${x.o} ahora, hasta ${sayTimeEs(t)}`],
  closesSoon: (x, t) => [`${x.name} está abiert${x.o}, pero cierra pronto, a ${showTimeEs(t)}.`, `${x.sn} está abiert${x.o}, pero cierra pronto, ${aTimeEs(t)}`],
  closedNow: (x, today, w) => { const why = today ? 'hoy' : 'ahora'; return [`No, ${x.name} está cerrad${x.o} ${why}. Abre ${w.show}.`, `No. ${x.sn} está cerrad${x.o} ${why}. Abre ${w.say}`]; },
  closedNoNext: (x) => [`No, ${x.name} está cerrad${x.o} y no se sabe cuándo abre.`, `No. ${x.sn} está cerrad${x.o} y no sé cuándo abre`],
  price: (v) => (v == null ? 'No sé qué tan caro es'
    : ['', 'Es de los lugares más baratos de nuestra lista', 'Sus precios son moderados', 'Es de los lugares más caros de nuestra lista', 'Es de los lugares más caros de nuestra lista'][v]),
  susanWrote: (month) => `Susan York escribió sobre este lugar en ${month}`,
  didntCatch(names) {
    const joined = names.length > 1 ? names.slice(0, -1).join(', ') + ' o ' + names[names.length - 1] : names[0];
    return names.length ? ['No entendí el nombre del lugar. ¿Quisiste decir:', `No entendí el nombre del lugar. ¿Quisiste decir ${joined}?`]
      : ['No entendí el nombre del lugar. Dilo otra vez o escríbelo.', 'No entendí el nombre del lugar. Dilo otra vez o escríbelo.'];
  },

  // [plural, singular, gender]: "lugares baratos para comida mexicana", "terrazas con vista", "lugares para ver el atardecer"
  places: ['lugares', 'lugar', 'm'],
  recommended: ['lugares que recomendamos', 'lugar que recomendamos', 'm'],
  kinds: { bfast: ['cafés', 'café', 'm'], mex: ['lugares de comida mexicana', 'lugar de comida mexicana', 'm'], world: ['lugares de cocina del mundo', 'lugar de cocina del mundo', 'm'],
    street: ['puestos de comida callejera', 'puesto de comida callejera', 'm'], share: ['bares', 'bar', 'm'], roof: ['terrazas', 'terraza', 'f'], wine: ['viñedos', 'viñedo', 'm'] },
  kind({ cat, foods, feats, price, local, unique }) {
    if (!cat && !foods.length && feats.length === 1 && !price && !local && !unique) return [feats[0].es, feats[0].es.replace(/^lugares\b/, 'lugar').replace(' que aceptan ', ' que acepta '), 'm'];
    let [pl, sg, g] = cat ? cat.nounEs : ['lugares', 'lugar', 'm'];
    if (local) [pl, sg, g] = ['lugares sencillos y locales', 'lugar sencillo y local', 'm'];
    if (unique) [pl, sg, g] = ['lugares diferentes', 'lugar diferente', 'm'];
    const adj = (one) => (price === 'low' ? (g === 'f' ? (one ? ' barata' : ' baratas') : one ? ' barato' : ' baratos') : price === 'high' ? (one ? ' elegante' : ' elegantes') : price === 'mid' ? ' de precio moderado' : '');
    const trad = foods.find((t) => t.k === 'tradmex'), other = foods.filter((t) => t.k !== 'tradmex');
    const food = foods.length ? ` para ${trad && other.length ? other[0].es + (/s$/.test(other[0].es) ? ' tradicionales' : ' tradicional') : (other[0] || trad).es}` : '';
    const withs = feats.map((t) => t.withEs).join(' y');
    return [ins(pl, adj(false)) + food + withs, ins(sg, adj(true)) + food + withs, g];
  },
  label: (f, unique) => (unique && f.u_es) || f.w_es || '',
  inCentro: ' en el Centro', outOfTown: ' fuera de la ciudad', inArea: (a) => ` en ${a}`, onStreet: (s) => ` en la calle ${s}`, lang: 'es',
  near: (og, sight) => (og.sight ? ` cerca de ${sight}`.replace(' de el ', ' del ') : og.mine ? ' cerca de ti' : ' cerca del Jardín'),
  when(s, n, g, one, digits) {  // the adjective agrees with the noun: lugares abiertos, terrazas abiertas, un lugar abierto
    const adj = one ? (g === 'f' ? 'abierta' : 'abierto') : g === 'f' ? 'abiertas' : 'abiertos';
    if (s.late) return s.late === 'tonight' ? ` ${adj} ahora` : ` ${adj} ahora para ${LATE_ES[s.late]}`;
    if (s.meal) return s.meal === 'late' ? ` ${adj} tarde en la noche${s.noDay ? '' : ' ' + dayWordsEs(s.day, n)}` : ` ${adj} para ${MEAL_ES[s.meal]} ${dayWordsEs(s.day, n)}`;
    if (s.day != null) return ` ${adj} ${dayWordsEs(s.day, n)}`;
    const h = s.window % 60 === 0 ? s.window / 60 : null;
    const span = h === 1 ? 'la próxima hora' : h ? `las próximas ${digits ? h : sayNumEs(h, true)} horas` : `los próximos ${s.window} minutos`;
    return s.now ? ` ${adj} ahora o en ${span}` : ` ${adj} en ${span}`;
  },

  miss: (t) => `No encontré ${t.es || t.nounEs[0]} en la lista de este sitio`,
  priceMiss: (price, g) => `No conozco ningun${g === 'f' ? 'a' : 'o'} ${{ low: g === 'f' ? 'barata' : 'barato', high: 'elegante', mid: 'de precio moderado' }[price]}, así que aquí están todos`,
  foundNo: (kind, where) => `No encontré ${kind}${where}`,
  unclear: () => 'No estoy seguro de qué buscas',
  measured: (far) => (far ? 'No parece que estés en San Miguel ahora, así que medí desde el Jardín' : 'No sé dónde estás, así que medí desde el Jardín'),
  localNote: () => 'Todos los lugares de este sitio los eligió gente que vive en San Miguel',
  allDone: () => 'Esos son todos',
  amongSusan: ' entre las recomendaciones de Susan York',
  noneOf([pl, , g], where, when) {  // "Ninguno de los lugares para ir con niños está abierto para desayunar mañana."
    const de = g === 'f' ? 'Ninguna de las' : 'Ninguno de los', w1 = when(g, true, false), w2 = when(g, true, true);
    return w1 ? [`${de} ${pl}${where} está${w2}.`, `${de} ${pl}${where} está${w1}`] : [`No encontré ${pl}${where}.`, `No encontré ${pl}${where}`];
  },
  nothing: (where, among, when) => [`No hay nada${where}${among}${when('m', true, true)}.`, `No encontré nada${where}${among}${when('m', true, false)}`],
  firstToOpen: (x, w) => [`El primero en abrir es ${x.name}, ${w.show}.`, `El primero en abrir es ${x.sn}, ${w.say}`],
  favWithPrice: false,  // "los mejores" with a price: no "favoritos" ("nuestros lugares baratos favoritos" reads badly)
  // "Aquí tienes cuatro lugares en el Centro", "dos de nuestros lugares favoritos para comida peruana"
  listHead({ k, offset, asked, susan, surprise, fav, recent, pl, thing, g0, where, when, priciest }) {
    const one = k === 1, f = susan || g0 === 'f', g = f ? 'f' : 'm';  // "las recomendaciones de Susan York" is feminine
    const wh = when(g, one, false), whShow = when(g, one, true), n1 = fav && one ? (f ? 'una' : 'uno') : sayNumEs(k, f);
    const favOf = (num) => `${num} de ${f ? 'nuestras' : 'nuestros'} ${ins(pl, f ? ' favoritas' : ' favoritos')}`;
    const susanOf = (num) => `${num} de las recomendaciones ${recent ? 'recientes ' : ''}de Susan York`;
    const subj = (num) => (susan ? susanOf(num) : fav ? favOf(num) : `${num} ${thing}`) + where;
    const order = priciest && k > 1 ? (f ? ', las más caras primero' : ', los más caros primero') : '';
    const say = offset > 0 ? `${cap(sayNumEs(k, f))} ${susan ? 'recomendaciones más de Susan York' : `${thing} más`}${where}${wh}`
      : k < asked ? `Encontré solo ${subj(n1)}${wh}${order}`
        : surprise ? `Una sorpresa: ${subj(n1)}${wh}`
          : `Aquí tienes ${subj(n1)}${wh}${order}`;
    const num = offset > 0 ? `${k} ${susan ? 'recomendaciones más de Susan York' : `${thing} más`}` : k < asked ? `Solo ${k}` : String(k);
    const what = fav && offset === 0 && !(k < asked) ? favOf(num) : `${num} ${thing}`;
    return [cap(offset > 0 ? `${num}${where}${whShow}.` : susan ? `${susanOf(num)}${where}${whShow ? ',' : ''}${whShow}.` : `${what}${where}${whShow}${order}.`), say];
  },
  opSay: ', uno de nuestros favoritos', opShow: '★ recomendado · ',
  sayDist: sayDistEs, showDist: showDistEs,
  rowSpans: (dw, sp) => [`${dw} ${sp.map(([x, y]) => `${clock(x)}–${untilEs(y)}`).join(', ')}`, `${dw} ${sp.map(([x, y]) => rangeEs(x, y)).join(', y ')}`],
  rowOpen: (x, t) => [`abiert${x.o} hasta ${showTimeEs(t)}`, `abiert${x.o} hasta ${sayTimeEs(t)}`],
  rowOpens: (w) => [`abre ${w.show.replace(/^hoy /, '')}`, `abre ${w.say.replace(/^hoy /, '')}`],
  rowClosed: (x) => `cerrad${x.o}`, rowNoHours: () => 'horario no publicado',
};

export const WORDS = { en: EN, es: ES };
