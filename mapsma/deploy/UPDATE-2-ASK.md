# MapSMA update 2: Ask in the menu of /page2 and /page3 (for a Claude session with server access)

The owner (22 Nov 2026): "Add ask icon (the page 5 voice feature) to the main photo/map menu on page 2". The menu of the photo page
(/page2) and the map (/page3) becomes Photos | Map | Ask (Fotos | Mapa | Voz), Ask opening the voice page /page5, as /page5's own menu
already does; on a phone, Ask is a microphone icon (the menu still fits a 360 px screen). /page2 also gets the changes the owner asked
for on 19–20 Nov that were waiting: the cards in a new random order each visit (sights keep theirs), the row "Susan York's latest
reviews" (open now or within two hours), and the descriptions from `/descs.js`. Both files keep tonight's new title and search /
sharing tags (the live pages of 21 Nov 23:02 UTC are their base). Same rules as before: delete nothing, no server configuration
change, no restart.

**First:** if update 1 is not applied yet (the live `page5/index.html` is still `b0f2bd25…`), apply `UPDATE-1-VENUES.md` first.

| File on the site | Live now (must match, else stop) | SHA-256 after |
|---|---|---|
| `page2/index.html` | `d69282512d3b4a004b2295fc062135dbe2204fca56f8454f897ce2717d0daafa` | `5d55e37d36e354547b838f007a301fac4522fb4d9e9d8f2a1a7ecfa97dbc0e61` |
| `page3/index.html` | `3ab0018246451d67fab9c42e842e6f5d4235e0fcf4893752cc11ffc71e3b97eb` | `4f88220f2d40f903d73c783514ffa8a5b05657458538ad20391e9b5f9ab13d89` |

/page2 also reads `/page5/susan.js` and `/descs.js`, already live from the first deploy (checked identical on 22 Nov).

## Steps

```sh
B=https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/claude/tiny-speech-bilingual-v7lyp0/mapsma
curl -fsSL "$B/page2/index.html" -o /tmp/page2-index.html && curl -fsSL "$B/page3/index.html" -o /tmp/page3-index.html
sha256sum /tmp/page2-index.html /tmp/page3-index.html            # must be 5d55e37d… and 4f88220f… as above

WEBROOT=/the/same/web/root/as/the/first/deploy
sha256sum "$WEBROOT/page2/index.html" "$WEBROOT/page3/index.html"   # must be d6928251… and 3ab00182… as above
```

If the downloads differ, the branch moved on: say so and ask. If a live file differs, someone changed that page since 21 Nov 23:02
UTC: **stop** and report (copying would undo their change). Otherwise:

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
sudo cp -p "$WEBROOT/page2/index.html" "$HOME/mapsma-page2-index-before-ask-$TS.html"
sudo cp -p "$WEBROOT/page3/index.html" "$HOME/mapsma-page3-index-before-ask-$TS.html"
sudo cp /tmp/page2-index.html "$WEBROOT/page2/index.html"            # keeps each file's owner and mode
sudo cp /tmp/page3-index.html "$WEBROOT/page3/index.html"
curl -s https://mapsma.com/page2/ | sha256sum                        # 5d55e37d…
curl -s https://mapsma.com/page3/ | sha256sum                        # 4f88220f…
```

Going back: copy the two backups to where they came from.

## Report, and the owner's check

Report the backups' paths and the two check lines. Then tell the owner: open https://mapsma.com/page2/ (close the tab and open it
again if it shows the old page). The menu at the top right reads Photos | Map | 🎤 (with "Ask" beside the microphone on a wider
screen; Fotos | Mapa | Voz in Spanish); tapping the microphone opens the voice page. The map's menu has the same. On /page2: the row
"Susan York's latest reviews" above the cards, the cards in a new order on each visit, and descriptions on places that had none.
