# MapSMA update 3: the ears' bigger word lists, leaning to the page's language, and a reminder to switch (for a Claude session with server access)

The owner (22 Nov 2026): "What music venues are open now" became "what music view open now", "what vegan restaurant is open"
became "y que no"; then "In the UI select EN so text is in English: why can't the ear model give more preference to English words
… and same Spanish when ES selected?". The ears can only write words in San Miguel's word list, and 614 words people use (venues,
nightlife, concerts, rooftops, views, Tuesday, weekend, tapas…) were not in it. This update brings the bigger list, plus one leaning
to English and one to Spanish, and /page5 loads the one for its language (at once: the link carries a version). When someone speaks the
other language (place names aside), /page5 now suggests switching, in their language, with a button. Measured: questions
using the new words understood 33% → 69% in English, 68% → 79% in Spanish. Four files; same rules as before: delete nothing, no
server configuration change, no restart.

The links below point at one commit (`e3b94f2ac17883edb2812d4d802809935318478f`), so what you download is exactly what was tested.

| File on the site | Live now (must match, else stop) | SHA-256 after |
|---|---|---|
| `tiny-speech/packs/mx-sma/ears-lexicon.json` | `1597d909fab183431d916774340abf77c49fb8432e0d54bc0447d25c0496ef1a` | `70ba1eef8aa8a31689fad3115f91fc31bf44c6e54c3890e053993ef90b7d86cd` |
| `tiny-speech/packs/mx-sma/ears-lexicon-en.json` | (new) | `b3861890be900898f69b0af1e4fdca5abb730207d50b58c425bdd3199b61ec0e` |
| `tiny-speech/packs/mx-sma/ears-lexicon-es.json` | (new) | `0d610f83fa9268cb409731bcb6e3589ea10d8b30ccc6ec1bd9914cd31715b95a` |
| `page5/index.html` | `99a039ca3290401d0873598e05d733e8de29dd051be3d2b87f831df690c68a52` | `0d12fa9c829677a1530d9c077009b12f29fbc2c7bce1e36e9c093b0594b77bdd` |

## Steps

```sh
C=https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/e3b94f2ac17883edb2812d4d802809935318478f
for f in ears-lexicon ears-lexicon-en ears-lexicon-es; do curl -fsSL "$C/tiny-speech/packs/dist/mx-sma/$f.json" -o /tmp/$f.json; done
curl -fsSL "$C/mapsma/page5/index.html" -o /tmp/page5-index.html
sha256sum /tmp/ears-lexicon.json /tmp/ears-lexicon-en.json /tmp/ears-lexicon-es.json /tmp/page5-index.html   # the "after" values

WEBROOT=/the/same/web/root/as/before
sha256sum "$WEBROOT/tiny-speech/packs/mx-sma/ears-lexicon.json" "$WEBROOT/page5/index.html"                 # the "live now" values
```

If a download differs, stop and ask. If a live file differs, someone changed it since update 1: **stop** and report. Otherwise:

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
P="$WEBROOT/tiny-speech/packs/mx-sma"
sudo cp -p "$P/ears-lexicon.json" "$HOME/mapsma-ears-lexicon-before-words-$TS.json"
sudo cp -p "$WEBROOT/page5/index.html" "$HOME/mapsma-page5-index-before-words-$TS.html"
OWNER=$(stat -c %U:%G "$P/ears-lexicon.json")
sudo cp /tmp/ears-lexicon.json "$P/ears-lexicon.json"                       # keeps its owner and mode
for l in en es; do sudo install -o "${OWNER%:*}" -g "${OWNER#*:}" -m 644 /tmp/ears-lexicon-$l.json "$P/ears-lexicon-$l.json"; done
sudo cp /tmp/page5-index.html "$WEBROOT/page5/index.html"
for f in ears-lexicon ears-lexicon-en ears-lexicon-es; do curl -s "https://mapsma.com/tiny-speech/packs/mx-sma/$f.json" | sha256sum; done
curl -s https://mapsma.com/page5/ | sha256sum                                # all four: the "after" values
```

Going back: copy the two backups to where they came from (the two new files can stay; nothing else reads them).

## Report, and the owner's check

Report the backups' paths and the four check lines. Then tell the owner: open https://mapsma.com/page5/ (close the tab first), keep
the EN|ES switch on the language you speak, and ask "What music venues are open now?": the words should now include "venues". Other
new words: nightlife, rooftops, views, concerts, Tuesday, weekend, tapas, Japanese. On the English page, a question asked in Spanish brings
"¿Hablas español? Cambia la página a Español…" with a button that switches. Better English hearing itself comes with the
retrained ears (a later update).
