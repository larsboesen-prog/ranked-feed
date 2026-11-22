# Changes for mapsma.com

The site's own source is not in this repository (nor in any repository this account has connected), so its changes are kept
here, each as the changed file, the page as it was served, and the change alone, with a test.

## /page2: a new random order of cards each visit (19 Nov 2026)

Every time someone comes to /page2 ("Places in photos"), each kind's cards (Coffee & bakery, Mexican, World food…) come in a new
random order, so no place always sits at the top. Places with photos still come first; **sights keep their order**; the numbers
on the cards (the map's) do not change. A visit is one stay on the page: closing a place's card with Back, or using the filters,
keeps the order (it is worked out from a random number drawn once per visit and each place's id, so a filtered list keeps the
same relative order); coming back from another page (the map, a link, even the browser's Back button) is a new visit and a new
order. Nothing is stored in the browser.

| File | What |
|---|---|
| `page2/index.html` | the page as served on **20 Nov 2026**, with this change and Susan York's latest reviews (below): deploy this as the site's `page2/index.html` |
| `page2/live-2026-11-19.html`, `page2/live-2026-11-20.html` | the page as served on 19 and 20 Nov 2026 (the 20th has the 18 Nov places.js / closed-status changes), unchanged |
| `page2/shuffle.patch` | the change alone (two places in the script): if /page2 has changed since, apply this instead: `patch <site>/page2/index.html < page2/shuffle.patch` |
| `test/page2-order.test.mjs` | the real page on a small made-up city in Chromium: one order per visit (Back from a card, filters), a new one each visit, every place reaching the top, sights fixed |

Test: `NODE_PATH=/opt/node-tools/node_modules node --test "mapsma/test/*.test.mjs"`. Also checked against the live site's data
(9 kinds): three visits gave three different orders in every kind with more than two places, sights stayed, no errors.

## /page2: Susan York's latest reviews, the ones open now or opening within two hours (20 Nov 2026)

Above the cards on /page2, a row "Susan York's latest reviews": of the ten places she reviewed most recently, the ones **open
now or opening within two hours** (San Miguel time), open ones first; each with a few words on what she said (ours, not hers;
Spanish on the ES page), the date, a link to her review, and either "See the place" (a place on /page2: opens its card) or
directions. "All 10" shows all ten, newest first, with their hours status. A search hides the row; with nothing open soon it
says so. Hours: a place on this site uses its own (Google's via photos/hours.json); a place that is not uses the hours her post
gives, marked "worth confirming" (Local, Lolita); one with no hours shows only under "All 10".

**Source: her blog, not Facebook.** Her Facebook is a personal account (Susan Knight York) that needs a login, and Facebook is
not reachable from here. Her blog's feed (cupcakesandcrablegs.com, posts to 30 Oct 2026) gives the ten: nine from "What's New San
Miguel?" (25 Sep 2026: Mario's, Bacco, Local, La Azotea, Atrio, Garnacha, Petit Four, La Estrella, Los Burritos) and Cenaduría
La Terraza at Lolita (23 Aug 2026). Her 30 Oct post is about a chef's award, not a place. She says the Facebook feed has a post
per restaurant (about 50): to use those, paste them (or their links) and they go into `susan.js` the same way. Only La Azotea is
one of this site's places (Petit Four is one of /page5's extra places); the other eight have no photos or map pin here.

| File | What |
|---|---|
| `page5/susan.js` | deploy as the site's `page5/susan.js`: `picks` unchanged (so /page5 answers the same), new `latest` (the ten) |
| `page2/index.html` | as above (20 Nov live page + the shuffle + this) |
| `page2/susan.patch` | this change alone, on top of `shuffle.patch`: `live-2026-11-20.html` + `shuffle.patch` + `susan.patch` = `index.html` |
| `test/page2-susan.test.mjs` | the real page in Chromium with the clock set: open now / within two hours / later / unknown / temporarily closed / after midnight, "See the place", All 10, Spanish, search, and the page without susan.js |

Checked against the live site's data at phone width (no errors, no sideways scroll): Friday 12:45 showed La Azotea, Petit Four
and Lolita; Friday 18:30 Local, La Azotea, Petit Four (closing soon) and Lolita.

**Photos:** none added. Photos on Google Maps belong to the people who took them (Google's terms do not allow copying them), and
her own photos are © Susan Knight York. Ways that work: ask her (or the restaurants) for permission and a credit line, as this
site does for Wikimedia photos; or show Google's photos through the Places API with the photographer's credit as its terms ask.

## Listing descriptions (20 Nov 2026)

47 of the 78 places on the site had no description (`desc: ""`). `listings/descriptions-2026-11-20.json` has one for each, in the
site's style (60–140 characters, our words, from each place's listing source and web searches), with Spanish (`desc_es`), the
sources, the confidence and doubts found. **37 are ready** (`apply: true`). **10 could not be confirmed online** (`apply: false`:
Quesadillas, Market tamales, Amor & Cacao, Arriba y Abajo, Nieves de San Felipe, Esquites, Café Oratorio, Esquites y mollejitas,
TorrArt Café, Bacal): drafted from the name and kind only, so check them on the spot or leave them empty. Put `desc` into
data/*.json and run scripts/rebuild.py (the site's own tools, not in this repository).

Doubts worth a look (`check`): hours that differ from Wanderlog (Jacques, Lima, Casa Nostra, Tostévere, Bocaciega, Fenicia);
Cava Sautto may have closed or moved (website offline, nothing from 2025–26); Selina's chain was renamed Socialtel and one source
calls the rooftop "Anónimo"; Jacques and Rústica are brunch places listed under Coffee & bakery; San Mezcal closes for a season
(reopens Sep/Oct); La Chope is a sports bar in recent reviews, Spanish/Mediterranean in one listing; Amapola's number (117 or 119).

## /page5: "★ Our pick" instead of "Not our pick", and details for the extra places (20 Nov 2026)

The owner: "Listings 'not our pick' lack details. Fix. Remove not our pick and instead mark our selection 'our pick'."

- **No more "Not our pick"** anywhere on /page5: not on the extra places' cards, not in their detail card ("Not one of our
  picks: listed so you get an answer."), not in the written or spoken answers.
- **Our picks are marked "★ Our pick"** ("★ Recomendado" in Spanish) on every card in an answer (sights excepted), and their
  detail card says "★ Our pick: chosen by people who live here". In an answer that lists both kinds, the written lines start
  with "★ our pick ·" and the voice says "…, one of our picks" for ours (before, it marked the others).
- **Details for the 18 extra places:** each now has a description (English and Spanish, neutral: the site lists them but does
  not recommend them) instead of three words. `listings/extras-2026-11-20.json` has them with sources and doubts: El Pato may have
  moved (older guides put it on Calzada de la Estación); there are two El Puerto (Canal 94 and San Pedro 14); Áperi's chef and
  address differ between sources; hours differ for Quince, Fátima 7, Tío Lucas and La Colmena (no hours on the site).
  They still have no photo, map pin, Save or Share (the map and photo pages leave the extra places out, as before).
- **`/descs.js`** (new, at the site's root): the descriptions in English and Spanish for every place whose data has none, 55
  in all (the 37 ready ones from the listing check above and the 18 extra places). /page2 and /page5 show them; they are not
  used to answer questions (answers stay exactly as before). Built from `listings/*.json` by `node mapsma/listings/build-descs.mjs`;
  once they are in data/*.json (and rebuild.py carries a Spanish one), this file can go. The map (/page3) does not load it.

| File | What |
|---|---|
| `descs.js` | deploy as the site's `/descs.js` |
| `page5/index.html`, `ask.js`, `words.js`, `rules.js`, `susan.js` | deploy to the site's `page5/` (the 20 Nov live files with the change; susan.js from above) |
| `page5/live-2026-11-20/` | the page-5 files as served on 20 Nov 2026, unchanged (read.js, listen.js, spanish.js: not changed, here for the test) |
| `page2/index.html`, `page2/descs.patch` | also loads `/descs.js` now (`live-2026-11-20.html` + `shuffle.patch` + `susan.patch` + `descs.patch` = `index.html`) |
| `test/page5-picks.test.mjs` | the real /page5 in Chromium on the made-up city, asking by typing: ours marked, the extra not, no "not our pick", the extra's description, Spanish |

Checked with the live site's data at phone width: "carnitas" gives Luna de Queso and Birria Xalisco marked "★ Our pick" and
Carnitas El Güero unmarked, whose card now reads "Family-run taco spot across the road from the lookout on the Querétaro road…";
"Indian food" gives Ghar alone, unmarked. No errors.

## /page5: the phone's own voice (20 Nov 2026)

The owner: "I'm not hearing a voice speak in Spanish or in English unless I pick tiny Voca - the devices own voice doesn't work."
tiny-voca plays through the page's audio player; "This phone's own voice" uses the browser's speech (speechSynthesis), which is
kept quiet by things the player is not. `page5/index.html` now handles each known cause:

- **iPhone silent switch**: the phone's voice is muted when the side switch is on silent (tiny-voca, played as media, is not).
  While it speaks, the page asks for a media sound session (`navigator.audioSession.type = "playback"`, Safari 16.4+) and plays
  silence on its player, which keeps that session; before recording it hands the session back (`"auto"`).
- **Speaking right after a cancel**: the old code cancelled and spoke in the same instant, which Safari and Chrome can drop. Now it
  cancels only what is speaking and waits 250 ms.
- **Voices that arrive late** (Chrome, Android): it waits up to 1.5 s for the list, so the Mexican or English voice is chosen.
- **All sentences queued at once** (Chrome stops after about 15 s; iOS can drop queued ones): one sentence after another.
- **Still silent after 4 s**: it says so and why (on an iPhone: the side switch, and Settings › Accessibility › Spoken Content ›
  Voices); on the English page tiny-voca reads instead.

`test/page5-voice.test.mjs` runs the page with a stand-in for the browser's speech (voices that arrive late, one that never
starts, an iPhone). A headless browser has no real voice, so the last check is the owner's phone: Voice settings › This phone's
own voice › Test the voice, in English and in Spanish, with the side switch on silent and on ring. Deploy: `page5/index.html`
(as above, it also carries the "★ Our pick" change).

## /page5: MapSMA's own voice, in Spanish and English (21 Nov 2026)

The owner: "Use this voice on mapsma" (the trained bilingual tiny-voca, the warm local guide from Guanajuato; listening page
https://claude.ai/artifact/Ep52gPWQDZjHm2DMqJKBSG). /page5 now reads its answers with it, **Spanish answers too** (until now the
phone's own voice read Spanish, decision D7): one 8 MB file instead of the ONNX voice's 45 MB, through the shared core's plain-JS
worker (no onnxruntime, no Pyodide). The phone's own voice stays a choice in Voice settings; if it does not start, MapSMA's voice
reads instead, in either language.

What changed in `page5/index.html`: the voice worker is `/tiny-speech/browser/tinyvoca-js-worker.js` with the voice file
`/tiny-speech/vendor/tiny-voca/tiny-voca-mx1-2026-11-21.gguf` (checked against its SHA-256, kept on the phone); each answer is
read as MX1 with `lang` "es" on the Spanish page and "en" on the English page; MapSMA's voice is the default in both languages; the
labels say "MapSMA's voice (about 8 MB, once)" and "about 50 MB the first time" for speech recognition and the voice together.

**To deploy**, besides the files above: the shared core under `/tiny-speech/` (the folders `browser/`, `engines/`, `lang/`,
`core/`, `vendor/` of `tiny-speech/`, as `tiny-speech/browser/README.md` step 1 says), which now includes the voice file
(`vendor/tiny-voca/tiny-voca-mx1-2026-11-21.gguf`, 8 MB, in git). /page5's own `tinyvoca-worker.js` and `tinyvoca/dizione.zip`
are no longer used by it.

`test/page5-mapsma-voice.test.mjs`: the real page, worker and voice file in Chromium: the Spanish page defaults to MapSMA's voice
and reads Spanish as MX1 (two sentences of real audio), the English page reads English with the same voice. The check on the
owner's iPhone after deploying: Voice settings › Test the voice, in Spanish and English; how long the first answer takes the first
time (the 8 MB file) and after.

## /page5: MapSMA's ears, and the upload (21 Nov 2026)

The owner: "Deploy to page 5". /page5 now **hears** questions with MapSMA's ears too (tiny-speech's tiny ears: 8.9 MB, San
Miguel's word list, one model for both languages, no names hint), through the shared core's `asr-worker.js` with model
`tiny-ears`. Voice settings gain "Hear questions with": MapSMA's ears (default) or Whisper tiny (as before: tiny.en in English,
tiny told Spanish in Spanish, with the names hint, in the same cache `mapsma-voice-libs-1`, so nothing is downloaded twice). If
the ears cannot load, the page asks Whisper by itself. A credit line in Voice settings names the ears' licence (CC BY-SA 4.0) and
datasets, and tiny-voca. First visit about 30 MB. `test/page5-ears.test.mjs`: a recorded Spanish question through a fake
microphone is heard word for word ("hay música en vivo en raindog cantina"), the Whisper choice, the fallback.

**The upload**: `sh mapsma/deploy/build.sh out.zip` makes a zip from the committed files: `mapsma.com/` (copy its contents to the
web root: `page5/` five files, `descs.js`, `tiny-speech/` about 18 MB), `backup/page5/` (the live files it replaces) and
`DEPLOY.txt` (steps and phone checks). Checked before handing over: the live /page5 files are byte for byte the copies these
changes start from (served since 18 Nov), and the zip's files served over the live site's own data in Chromium heard a spoken
Spanish question word for word and read the answers in Spanish and English with MX1. Note: Mama Mía, Raindog Cantina, Johnny's
Piano Bar and Casa Europa are in tiny-speech's pack (the ears know their names) but not in the site's places.js, so /page5 does
not answer about them by name until they are added to the site's data.

## Deployed (21 Nov 2026, 22:45 UTC), and update 1: the live music venues

A Claude session with server access deployed /page5 from `deploy/FOR-CLAUDE.md` (the live `page5/index.html` is `b0f2bd25…`). The
owner then asked "Where is Johnny's piano bar" and got four other bars: the four music venues (Mama Mía, Raindog Cantina, Johnny's
Piano Bar, Casa Europa) are in tiny-speech's pack, not in the site's `places.js`. `page5/venues.js` (made by
`listings/build-venues.mjs` from the pack) adds them to /page5 as extra places (no "★ Our pick"), each only while the site's data has
no place of that name, with their address, what they are and Johnny's hours; a kind the page does not know falls back to "Bars &
small plates". `test/page5-venues.test.mjs`: Johnny's answered with its hours and card, Raindog and Mama Mía (ES) by name, no
duplicate once the site's data carries one. To put on the server: `deploy/UPDATE-1-VENUES.md` (two files). Once the site's own data
(data/*.json, rebuild.py) has the venues, `venues.js` can go.

## Update 2 (22 Nov 2026): Ask in the menu of /page2 and /page3

The owner: "Add ask icon (the page 5 voice feature) to the main photo/map menu on page 2". The menu of /page2 and /page3 is now
Photos | Map | Ask (Fotos | Mapa | Voz), Ask opening /page5, as /page5's own menu; Ask's label is set in the page (the shared
i18n.js has no "Ask"; the ES|EN switch reloads the page). On a phone (the site hides menu icons below 421 px) Ask is the word, as Photos
and Map are (owner: "I like ask not mic image, Voz ok for Spanish"; a microphone icon was tried first), and the menu keeps a 14–16 px
margin on a 360 px screen (measured over the live data, EN and ES, 360/375/390 px); on a wider screen 🎙 Ask, as /page5's own menu. `page3/` is new here: `live-2026-11-21.html` (as served) and `index.html` (+ Ask only).
/page2 was rebased on its live page of 21 Nov 23:02 UTC (`page2/live-2026-11-21.html`: a new title and search / sharing tags, body
unchanged), so `page2/index.html` = that page + shuffle + Susan's latest reviews + descriptions + Ask. `test/page2-ask.test.mjs`.
To put on the server: `deploy/UPDATE-2-ASK.md` (after update 1).
