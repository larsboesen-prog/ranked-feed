# MapSMA update 4: the retrained ears, much better in English (for a Claude session with server access)

The owner (21–22 Nov 2026): "Speak out is good in English but understanding English is poor" — "where can I eat tacos now" came out
"we can i tacos". The ears were retrained with English restaurant questions read by about 1,000 English voices. Measured on voices
it never heard: English questions understood **67% → 88%** (words wrong 22% → 10%, place names found 57 → 89 of 93), Mexican
Spanish 87.5% → 91.0%. Three files: a new model file beside the old one, /page5 pointing at it, and the shared config. Same rules as
before: delete nothing, no server configuration change, no restart.

The links below point at one commit (`2329b49da56af581d0e232b1f4736794474d758f`), so what you download is exactly what was tested.

| File on the site | Live now (must match, else stop) | SHA-256 after |
|---|---|---|
| `tiny-speech/engines/ears/ears-int8-2026-11-22.onnx` | (new; the old `-2026-11-20.onnx` stays) | `9630d40e72cd203c4126d3a8e7ed8f169a81e1da770532f5d94f0f476ab90fe9` |
| `page5/index.html` | `0d12fa9c829677a1530d9c077009b12f29fbc2c7bce1e36e9c093b0594b77bdd` (update 3) | `ae4b13385106a8cf297db728f104a84c5b0f4046172d984ea5f18ae1f0c60564` |
| `tiny-speech/apps/mapsma.json` | `01b194cce5eecf8d3e34bf3c1553a5a73ef8190b8948044eebdf20dd004ec592` | `853471a5df39fb6f8021f06f97083c7a1926141928cdd3d98f945a37a6c8851e` |

## Steps

```sh
C=https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/2329b49da56af581d0e232b1f4736794474d758f
curl -fsSL "$C/tiny-speech/engines/ears/ears-int8-2026-11-22.onnx" -o /tmp/ears-int8-2026-11-22.onnx
curl -fsSL "$C/mapsma/page5/index.html" -o /tmp/page5-index.html
curl -fsSL "$C/tiny-speech/apps/mapsma.json" -o /tmp/mapsma.json
sha256sum /tmp/ears-int8-2026-11-22.onnx /tmp/page5-index.html /tmp/mapsma.json      # the "after" values

WEBROOT=/the/same/web/root/as/before
sha256sum "$WEBROOT/page5/index.html" "$WEBROOT/tiny-speech/apps/mapsma.json"        # the "live now" values
```

If a download differs, stop and ask. If a live file differs, someone changed it since update 3: **stop** and report. Otherwise:

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
E="$WEBROOT/tiny-speech/engines/ears"
sudo cp -p "$WEBROOT/page5/index.html" "$HOME/mapsma-page5-index-before-english-ears-$TS.html"
sudo cp -p "$WEBROOT/tiny-speech/apps/mapsma.json" "$HOME/mapsma-apps-mapsma-before-english-ears-$TS.json"
OWNER=$(stat -c %U:%G "$E/ears-int8-2026-11-20.onnx")
sudo install -o "${OWNER%:*}" -g "${OWNER#*:}" -m 644 /tmp/ears-int8-2026-11-22.onnx "$E/ears-int8-2026-11-22.onnx"
sudo cp /tmp/mapsma.json "$WEBROOT/tiny-speech/apps/mapsma.json"                    # keeps its owner and mode
sudo cp /tmp/page5-index.html "$WEBROOT/page5/index.html"                           # last: the page only now asks for the new model
curl -s https://mapsma.com/tiny-speech/engines/ears/ears-int8-2026-11-22.onnx | sha256sum
curl -s https://mapsma.com/tiny-speech/apps/mapsma.json | sha256sum
curl -s https://mapsma.com/page5/ | sha256sum                                        # all three: the "after" values
```

Going back: copy the two backups to where they came from (the page then asks for the old model again, which stays in place).

## Report, and the owner's check

Report the backups' paths and the three check lines. Then tell the owner: open https://mapsma.com/page5/ (close the tab first); the
first question downloads the new 8.9 MB model once. On the English page ask "Where can I eat tacos now?", "Is La Azotea open now?",
"What music venues are open now?" and "Estoril, when is it open?"; on the Spanish page "¿Está abierta La Azotea?".
