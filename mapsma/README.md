# Changes for mapsma.com

The site's own source is not in this repository (nor in any repository this account has connected), so its changes are kept
here, each as the changed file, the page as it was served, and the change alone, with a test.

## /page2: the cards take turns at the top (19 Nov 2026)

Every time someone comes to /page2 ("Places in photos"), each kind's cards (Coffee & bakery, Mexican, World food…) start one
place further along, so every place has its turn at the top. Places with photos still come first; **sights keep their order**;
the numbers on the cards (the map's) do not change. A visit is one stay on the page: closing a place's card with Back, or using
the filters, keeps the order; coming back from another page (the map, a link, even the browser's Back button) is a new visit.
The turn is a counter in the browser's own storage (`sma-turn`, nothing personal); a browser that refuses storage starts at a
random place instead.

| File | What |
|---|---|
| `page2/index.html` | the page as served on 19 Nov 2026, with the change: deploy this as the site's `page2/index.html` |
| `page2/live-2026-11-19.html` | the page as served on 19 Nov 2026, unchanged |
| `page2/rotation.patch` | the change alone (two places in the script): if /page2 has changed since, apply this instead: `patch <site>/page2/index.html < page2/rotation.patch` |
| `test/page2-rotation.test.mjs` | the real page on a small made-up city in Chromium: reload, Back from a card, filters, back from another page, no storage |

Test: `NODE_PATH=/opt/node-tools/node_modules node --test "mapsma/test/*.test.mjs"`. Also checked against the live site's
data (67 photos, 9 kinds): each visit moved every kind one place along (Coffee & bakery started at 2, then 3, then 8), sights
stayed, no errors.
