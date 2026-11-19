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
| `page2/index.html` | the page as served on 19 Nov 2026, with the change: deploy this as the site's `page2/index.html` |
| `page2/live-2026-11-19.html` | the page as served on 19 Nov 2026, unchanged |
| `page2/shuffle.patch` | the change alone (two places in the script): if /page2 has changed since, apply this instead: `patch <site>/page2/index.html < page2/shuffle.patch` |
| `test/page2-order.test.mjs` | the real page on a small made-up city in Chromium: one order per visit (Back from a card, filters), a new one each visit, every place reaching the top, sights fixed |

Test: `NODE_PATH=/opt/node-tools/node_modules node --test "mapsma/test/*.test.mjs"`. Also checked against the live site's data
(9 kinds): three visits gave three different orders in every kind with more than two places, sights stayed, no errors.
