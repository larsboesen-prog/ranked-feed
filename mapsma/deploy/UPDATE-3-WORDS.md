# MapSMA update 3: the ears' bigger word list (for a Claude session with server access)

The owner (22 Nov 2026): "What music venues are open now" became "what music view open now", "what vegan restaurant is open"
became "y que no". The ears can only write words in San Miguel's word list, and 614 words people use (venues, nightlife, concerts,
rooftops, views, Tuesday, weekend, tapas…) were not in it. This update replaces the word list and makes /page5 fetch the new one at
once. Measured: questions using those words understood 33% → 69% in English, 68% → 78% in Spanish. Two files; same rules as
before: delete nothing, no server configuration change, no restart.

The links below point at one commit (`ebe1fb27d4b3329a868d447dab4818a7634e7a30`), so what you download is exactly what was tested (a branch link can be
served from GitHub's cache for up to five minutes).

| File on the site | Live now (must match, else stop) | SHA-256 after |
|---|---|---|
| `tiny-speech/packs/mx-sma/ears-lexicon.json` | `1597d909fab183431d916774340abf77c49fb8432e0d54bc0447d25c0496ef1a` | `70ba1eef8aa8a31689fad3115f91fc31bf44c6e54c3890e053993ef90b7d86cd` |
| `page5/index.html` | `99a039ca3290401d0873598e05d733e8de29dd051be3d2b87f831df690c68a52` | `1a389adea1fd7313909f436e8d4066a1d075d579a0a68c99180ee583c6205f4d` |

## Steps

```sh
C=https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/ebe1fb27d4b3329a868d447dab4818a7634e7a30
curl -fsSL "$C/tiny-speech/packs/dist/mx-sma/ears-lexicon.json" -o /tmp/ears-lexicon.json
curl -fsSL "$C/mapsma/page5/index.html" -o /tmp/page5-index.html
sha256sum /tmp/ears-lexicon.json /tmp/page5-index.html          # must be the "after" values above

WEBROOT=/the/same/web/root/as/before
sha256sum "$WEBROOT/tiny-speech/packs/mx-sma/ears-lexicon.json" "$WEBROOT/page5/index.html"   # must be the "live now" values
```

If a download differs, stop and ask. If a live file differs, someone changed it since update 1: **stop** and report. Otherwise:

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
sudo cp -p "$WEBROOT/tiny-speech/packs/mx-sma/ears-lexicon.json" "$HOME/mapsma-ears-lexicon-before-words-$TS.json"
sudo cp -p "$WEBROOT/page5/index.html" "$HOME/mapsma-page5-index-before-words-$TS.html"
sudo cp /tmp/ears-lexicon.json "$WEBROOT/tiny-speech/packs/mx-sma/ears-lexicon.json"      # keeps each file's owner and mode
sudo cp /tmp/page5-index.html "$WEBROOT/page5/index.html"
curl -s https://mapsma.com/tiny-speech/packs/mx-sma/ears-lexicon.json | sha256sum            # the "after" value
curl -s https://mapsma.com/page5/ | sha256sum                                                # the "after" value
```

Going back: copy the two backups to where they came from.

## Report, and the owner's check

Report the backups' paths and the two check lines. Then tell the owner: open https://mapsma.com/page5/ (close the tab first), and ask
by voice "What music venues are open now?": the words should now include "venues". Other new words: nightlife, rooftops, views,
concerts, Tuesday, weekend, tapas, Japanese. Better English hearing itself comes with the retrained ears (a later update).
