// MapSMA /page5 (Ask by voice): the rules the answers follow, in one place (Lars, 18 Nov 2026: "Do 4-7", 5: "your rules in one place").
// Change a value here, then: `node tests/run.mjs` shows which answers change; `node scripts/rules-doc.mjs` rewrites the plain-language
// list (docs/page5-answer-rules.md). Times are "H:MM", San Miguel time; durations in minutes; distances in metres.
export const RULES = {
  openNowWithin: 120,          // Lars, 17 Nov: "open now (next 2 hrs)"
  closingSoon: 45,
  centroRadius: 650,
  meals: {                     // the same hours as the map's "When?" menu
    bfast: { from: '8:00', to: '10:30', atLeast: 60 },
    brunch: { from: '10:00', to: '14:00', atLeast: 90 },
    lunch: { from: '13:00', to: '16:00', atLeast: 90 },
    dinner: { from: '19:30', to: '21:30', atLeast: 60 },
    late: { from: '23:00', to: '1:00', atLeast: 30 },
  },
  lateMealFor: 120,
  lateMealWithin: 30,
  tonightNowBefore: '5:00',
  cafesWhenNothingAsked: { from: '5:00', to: '11:30' },  // Lars, 18 Nov: "separate restaurants and cafes … not always showing by default"
  picksFirst: true,            // Lars, 18 Nov: "We should call out who we recommend"
  listCount: 4,
  susanCount: 3,
  maxCount: 8,
  susanRecentDays: 548,
  walkMetresPerMinute: 75,
  nearMeWithin: 25000,
};

// The same rules in plain words, for docs/page5-answer-rules.md ({v} is the value).
export const RULE_WORDS = {
  openNowWithin: '"Open now" means open now, or opening within {v} minutes.',
  closingSoon: 'A place that closes within {v} minutes does not count as open ("Closing soon").',
  centroRadius: '"Centro" means within {v} metres of the Jardín (Guadalupe is never Centro).',
  meals: 'Breakfast, brunch, lunch, dinner and late night: a place counts when it is open at least the given minutes inside those hours. Asked without a day: today while the hours last.',
  lateMealFor: 'Up to {v} minutes after a meal\'s hours end, the meal means "open now, for a late breakfast / lunch / dinner"; after that, tomorrow\'s. Never for places out of town (a drive away).',
  lateMealWithin: 'For a late meal, a place must be open now or open within {v} minutes.',
  tonightNowBefore: '"Tonight" after the dinner hours, or after midnight until {v}, means what is open now.',
  cafesWhenNothingAsked: 'Cafés (coffee, bakery, sweets, breakfast places) never answer lunch, dinner, tonight, late night or "restaurants". When a question names no kind of place, they are included only between these times.',
  picksFirst: 'Our picks always come first; the extra places (not our picks) only after them, each marked "not one of our picks".',
  listCount: 'A list shows {v} places at a time ("4 more" for the next ones).',
  susanCount: 'Susan York\'s picks: {v} at a time.',
  maxCount: 'At most {v} places in one answer, whatever number is asked for.',
  susanRecentDays: 'Susan York\'s "recent" picks: written about in the last {v} days.',
  walkMetresPerMinute: 'Walking time: {v} metres a minute (hills and cobbles).',
  nearMeWithin: '"Near me" uses the phone\'s location when it is within {v} metres of the Jardín; farther away, distances are measured from the Jardín.',
};

// "H:MM" -> minutes after midnight; a span that ends after midnight ends the next day.
export const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
export const span = ({ from, to }) => { const a = toMin(from); let b = toMin(to); if (b <= a) b += 1440; return [a, b]; };
