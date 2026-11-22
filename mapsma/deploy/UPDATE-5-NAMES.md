# MapSMA update 5: place names found by sound (for a Claude session with server access)

The owner (22 Nov 2026): "it still fails on place names said with my Danish-English accent. 'Estoril' is not recognised at all…
1. Match place names by sound… 2. Ask when unsure… One tap picks the place." No new model. The ears now also look for each place
name in the sounds they hear; when the written words miss the name, /page5 answers about a clear winner ("Heard as Estoril") or
offers the two or three closest names as buttons ("Did you mean: Estoril, …"). Measured on 560 accented test questions: names
found 370 → 402, 81 more one tap away, a wrong place 14 → 10; on 659 ordinary English and Spanish questions, no new wrong answer.

Six files: two new, four changed. Same rules as before: delete nothing, no server configuration change, no restart. The links
point at one commit (`53ae13d2a616fbbdd654f28d0a49914410986bea`), so what you download is exactly what was tested.

| File on the site | Live now (must match, else stop) | SHA-256 after |
|---|---|---|
| `tiny-speech/engines/ears-spot.js` | (new) | `2f949a09513fdafc3054c01966b9074d7ed8053d7e4ad00591ba89b01071c5cf` |
| `tiny-speech/packs/mx-sma/ears-names.json` | (new) | `69dd8d3be3ec5cc693ed4436f5a5fcbda70597185f0d13a3d14ad9d2000934af` |
| `tiny-speech/engines/asr-ears.js` | `ac88b0fa5e234a18893dd9b428efeb5a8b86be1d0da91ba7646c2b4b09f6c737` | `70cd758ee2419d0d95d299ef516b2f4bbdfde816a9b5da3d83f82da98bc3f098` |
| `tiny-speech/browser/asr-worker.js` | `e0c5de1445efd3dbfc368c82ecd990a2ee7e7393dac9a8e10c4d3adf337f7c6a` | `e486cc1ac8fa5213636e849c71e1b2f0095202de9258632ee05e1cf5f3dcc187` |
| `page5/ask.js` | `4224263859feee69e1674cdfb76a5d29e199bf3af22289037eeffbcd8c040558` | `4f95373127c03a2e0f38c9609fcad54bc32064e0093f8027280f1d96d8bc078b` |
| `page5/index.html` | `ae4b13385106a8cf297db728f104a84c5b0f4046172d984ea5f18ae1f0c60564` (update 4) | `86048df7c0152f0215fb5057d645832a04abdb7b74e446b82c795e666192f755` |

(In the repository the names file is `tiny-speech/packs/dist/mx-sma/ears-names.json`; on the site `packs/dist/` is `packs/`, as for
the word lists.)

## Steps

```sh
C=https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/53ae13d2a616fbbdd654f28d0a49914410986bea
curl -fsSL "$C/tiny-speech/engines/ears-spot.js" -o /tmp/ears-spot.js
curl -fsSL "$C/tiny-speech/packs/dist/mx-sma/ears-names.json" -o /tmp/ears-names.json
curl -fsSL "$C/tiny-speech/engines/asr-ears.js" -o /tmp/asr-ears.js
curl -fsSL "$C/tiny-speech/browser/asr-worker.js" -o /tmp/asr-worker.js
curl -fsSL "$C/mapsma/page5/ask.js" -o /tmp/page5-ask.js
curl -fsSL "$C/mapsma/page5/index.html" -o /tmp/page5-index.html
sha256sum /tmp/ears-spot.js /tmp/ears-names.json /tmp/asr-ears.js /tmp/asr-worker.js /tmp/page5-ask.js /tmp/page5-index.html   # the "after" values

WEBROOT=/the/same/web/root/as/before
sha256sum "$WEBROOT/tiny-speech/engines/asr-ears.js" "$WEBROOT/tiny-speech/browser/asr-worker.js" \
  "$WEBROOT/page5/ask.js" "$WEBROOT/page5/index.html"                                                 # the "live now" values
ls "$WEBROOT/tiny-speech/engines/ears-spot.js" "$WEBROOT/tiny-speech/packs/mx-sma/ears-names.json"   # must not exist yet
```

If a download differs, stop and ask. If a live file differs (or a new one already exists), someone changed the site since update 4:
**stop** and report. Otherwise:

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
sudo cp -p "$WEBROOT/tiny-speech/engines/asr-ears.js" "$HOME/mapsma-asr-ears-before-names-$TS.js"
sudo cp -p "$WEBROOT/tiny-speech/browser/asr-worker.js" "$HOME/mapsma-asr-worker-before-names-$TS.js"
sudo cp -p "$WEBROOT/page5/ask.js" "$HOME/mapsma-page5-ask-before-names-$TS.js"
sudo cp -p "$WEBROOT/page5/index.html" "$HOME/mapsma-page5-index-before-names-$TS.html"
E="$WEBROOT/tiny-speech/engines" P="$WEBROOT/tiny-speech/packs/mx-sma"
O1=$(stat -c %U:%G "$E/asr-ears.js"); O2=$(stat -c %U:%G "$P/ears-lexicon-en.json")
sudo install -o "${O1%:*}" -g "${O1#*:}" -m 644 /tmp/ears-spot.js "$E/ears-spot.js"          # new files first: nothing uses them yet
sudo install -o "${O2%:*}" -g "${O2#*:}" -m 644 /tmp/ears-names.json "$P/ears-names.json"
sudo cp /tmp/asr-ears.js "$E/asr-ears.js"                                                    # keeps its owner and mode
sudo cp /tmp/asr-worker.js "$WEBROOT/tiny-speech/browser/asr-worker.js"
sudo cp /tmp/page5-ask.js "$WEBROOT/page5/ask.js"
sudo cp /tmp/page5-index.html "$WEBROOT/page5/index.html"                                    # last: the page only now asks for names
for u in tiny-speech/engines/ears-spot.js tiny-speech/packs/mx-sma/ears-names.json tiny-speech/engines/asr-ears.js \
  tiny-speech/browser/asr-worker.js page5/ask.js page5/; do curl -s "https://mapsma.com/$u" | sha256sum; done   # all six: the "after" values
```

Each step leaves a working site: the old page ignores the new files, and the new worker without `&names=` behaves as before.
Going back: copy the four backups to where they came from; the two new files can stay (nothing asks for them).

## Report, and the owner's check

Report the backups' paths and the six check lines. Then tell the owner: close the /page5 tab and open https://mapsma.com/page5/ again
(English). Ask "Is Estoril open?" and "Estoril, when is it open?" in your own voice. When the words come out wrong ("is it open",
"a stroll…"), the answer is either Estoril's card with "Heard as Estoril" under the question, or "I didn't catch the place's name. Did
you mean:" with Estoril among the buttons (one tap). A question about a kind of place ("Where's the best mezcal bar?") still gets its
list, sometimes with "Or did you mean: San Mezcal" under it.

To measure the owner's own voice: record the 40 names once at https://larsboesen-prog.github.io/tiny-speech/record-names/ and hand
the saved file to Claude on the page it gave (a test set only, never training, never published).
