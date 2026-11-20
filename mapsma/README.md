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
