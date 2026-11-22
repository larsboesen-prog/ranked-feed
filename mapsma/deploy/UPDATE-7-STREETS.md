# MapSMA update 7: restaurants, streets and hotels (for a Claude session with server access)

The owner (22 Nov 2026): "show me some high end restaurants", "show me restaurants on umaran", "show me some quality restaurants"
failed; "Show me rooftop restaurants" was written "show me rooftop esta"; "Show me restaurants in live aqua" was written "show me
están sin light". What changes on /page5:

- **Streets**: "restaurants on Umarán", "what's on Mesones", "en la calle Hidalgo" list the places on that street (from their
  addresses). "Is Café Umarán open?" is still the café.
- **Hotels**: "near the Rosewood / the Belmond / Casa Blanca 7 / El Golpe de Vista" lists the places inside it, then the nearest.
  Live Aqua has no places on MapSMA yet, so the answer says "I found no places in Live Aqua" and shows Centro.
- **"Quality"** restaurants are our favourites; "high end" was already understood.
- **Hearing**: the street and hotel names are in the ears' word lists, with the list phrasing ("show me … restaurants", "restaurants
  on …"), and the English page also hears English words said closer to their spelling ("restaurants" was heard as "está").

Measured with stand-in voices (5 non-native, 2 native English): on 16 held-out list questions read by 10 voices, the right request
19.4% → 35.0% (the two native voices 13 → 21 of 32); ordinary English and Spanish questions unchanged.

Six files, all replacing ones from update 6. Same rules as before: delete nothing, no server configuration change, no restart. The
links point at one commit (`58e691da683708529a93e2b4df9eafc6864c545a`), so what you download is exactly what was tested.

| File on the site | Live now (update 6; must match, else stop) | SHA-256 after |
|---|---|---|
| `tiny-speech/packs/mx-sma/ears-lexicon-en.json` | `b3861890be900898f69b0af1e4fdca5abb730207d50b58c425bdd3199b61ec0e` | `d8e7d9e5057d3627c2c2ebb6d70200f9f4be52dbae458ae4b0ceb7d1a3bcf2a8` |
| `tiny-speech/packs/mx-sma/ears-lexicon-es.json` | `0d610f83fa9268cb409731bcb6e3589ea10d8b30ccc6ec1bd9914cd31715b95a` | `1c4071d6aae7cb26484e623273822ba69906ad1c5bd35446e1088d0cb410a07b` |
| `page5/read.js` | `9eb5a0f8400eb8556bf1ab4c66c33abfaa1122c0fc0e4c7ee7c258befa16e13f` | `10d13bfc0a868e9bd7a7f05466bce4dc44d3439953c85db3e649463b247831b0` |
| `page5/words.js` | `d255776d3cdd9756e8b1ae1f8714de79e12ad487960ef5542695975aec87906b` | `e0cafb2e9009b31bd506babf7b162be003bec7fd8d7f67e8642e54738ffab886` |
| `page5/ask.js` | `4f95373127c03a2e0f38c9609fcad54bc32064e0093f8027280f1d96d8bc078b` | `49d9bf75f51df07269444f8bc58b244eb02cba37d7c23497392c74994e5c4cce` |
| `page5/index.html` | `9d0de4b150ac7972c602e60c0f89ef037f2f35e874f8bd6151bd6acd545368b1` | `a172e6ccc86bcacfdfc8fdf9a05b09dfcf932b950ef04a0f7ac3af653342032a` |

In the repository the word lists are `tiny-speech/packs/dist/mx-sma/…`; on the site `packs/dist/` is `packs/`. `page5/read.js` in the
repository is `mapsma/page5/read.js` (until now the tests used the live copy in `mapsma/page5/live-2026-11-20/`).

## Steps

```sh
C=https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/58e691da683708529a93e2b4df9eafc6864c545a
curl -fsSL "$C/tiny-speech/packs/dist/mx-sma/ears-lexicon-en.json" -o /tmp/ears-lexicon-en.json
curl -fsSL "$C/tiny-speech/packs/dist/mx-sma/ears-lexicon-es.json" -o /tmp/ears-lexicon-es.json
curl -fsSL "$C/mapsma/page5/read.js" -o /tmp/page5-read.js
curl -fsSL "$C/mapsma/page5/words.js" -o /tmp/page5-words.js
curl -fsSL "$C/mapsma/page5/ask.js" -o /tmp/page5-ask.js
curl -fsSL "$C/mapsma/page5/index.html" -o /tmp/page5-index.html
sha256sum /tmp/ears-lexicon-en.json /tmp/ears-lexicon-es.json /tmp/page5-read.js /tmp/page5-words.js /tmp/page5-ask.js /tmp/page5-index.html  # "after"

WEBROOT=/the/same/web/root/as/before
P="$WEBROOT/tiny-speech/packs/mx-sma"
sha256sum "$P/ears-lexicon-en.json" "$P/ears-lexicon-es.json" "$WEBROOT/page5/read.js" "$WEBROOT/page5/words.js" \
  "$WEBROOT/page5/ask.js" "$WEBROOT/page5/index.html"                                                      # "live now"
```

If a download differs, stop and ask. If a live file differs, someone changed the site since update 6: **stop** and report. Otherwise:

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
for f in "$P/ears-lexicon-en.json" "$P/ears-lexicon-es.json" "$WEBROOT/page5/read.js" "$WEBROOT/page5/words.js" "$WEBROOT/page5/ask.js" "$WEBROOT/page5/index.html"; do
  sudo cp -p "$f" "$HOME/mapsma-before-streets-$TS-$(echo "$f" | sed 's#.*/\(page5\|mx-sma\)/#\1-#')"
done
sudo cp /tmp/ears-lexicon-en.json "$P/ears-lexicon-en.json"       # keep their owner and mode; the old page asks for these by another address
sudo cp /tmp/ears-lexicon-es.json "$P/ears-lexicon-es.json"
sudo cp /tmp/page5-read.js "$WEBROOT/page5/read.js"
sudo cp /tmp/page5-words.js "$WEBROOT/page5/words.js"
sudo cp /tmp/page5-ask.js "$WEBROOT/page5/ask.js"
sudo cp /tmp/page5-index.html "$WEBROOT/page5/index.html"         # last
for u in tiny-speech/packs/mx-sma/ears-lexicon-en.json tiny-speech/packs/mx-sma/ears-lexicon-es.json page5/read.js page5/words.js \
  page5/ask.js page5/; do curl -s "https://mapsma.com/$u" | sha256sum; done                                  # all six: the "after" values
```

The new read.js, words.js and ask.js work with the old page too (it asks for them by their old addresses, and they only add to what
it did). Going back: copy the six backups to where they came from.

## Report, and the owner's check

Report the backups' paths and the six check lines. Then tell the owner: close the /page5 tab and open https://mapsma.com/page5/ again
(the new word list, about 0.6 MB, comes with the first question). On the English page ask "Show me restaurants on Umarán", "Show me
some quality restaurants", "Show me rooftop restaurants", "Show me restaurants near the Rosewood" and "Show me restaurants in Live
Aqua"; the line under each question shows what was heard. On the Spanish page: "Restaurantes en la calle Mesones".
