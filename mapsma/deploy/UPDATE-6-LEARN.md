# MapSMA update 6: names by sound, and learning from picks (for a Claude session with server access)

**This update contains update 5.** Apply it whether or not update 5 was applied; if update 5 was not, skip it.

What it does on /page5 (owner, 22 Nov 2026):

- **Names by sound** (update 5): when a place name said with an accent comes out as other words ("Is Estoril open?" written "is it
  open"), the ears still find the name in the sounds. A clear winner is answered ("Heard as Estoril"); two or three close names are
  offered as buttons ("Did you mean: Estoril, …"). Measured on 560 accented test questions: names found 370 → 402, 81 more one tap
  away, a wrong place 14 → 10; on 659 ordinary English and Spanish questions, no new wrong answer.
- **Learning from picks** (new, owner: "build option 1"): a name picked under "Did you mean" is remembered on the phone, as the sounds
  the ears heard for it (never audio; nothing leaves the phone). The next time it is said that way it is answered directly. Measured:
  after one pick on "Is X open?", "X, when is it open?" found 192 → 211 of 280 names, no new wrong answer. Voice settings shows how
  many names were learned, with "Forget them"; the privacy line there says so.

Six files: up to two new, four changed. Same rules as before: delete nothing, no server configuration change, no restart. The links
point at one commit (`e5d6b70262c93a80dd892d03ebd2fdff5856c2ff`), so what you download is exactly what was tested.

| File on the site | Live now, update 4 | … or update 5 | SHA-256 after |
|---|---|---|---|
| `tiny-speech/engines/ears-spot.js` | (none) | `2f949a09513fdafc3054c01966b9074d7ed8053d7e4ad00591ba89b01071c5cf` | `a7cf809cb582f4d203cb37723390cd2e0ec6f171f0879000c79a8fd85752586c` |
| `tiny-speech/packs/mx-sma/ears-names.json` | (none) | `69dd8d3be3ec5cc693ed4436f5a5fcbda70597185f0d13a3d14ad9d2000934af` | `69dd8d3be3ec5cc693ed4436f5a5fcbda70597185f0d13a3d14ad9d2000934af` (unchanged) |
| `tiny-speech/engines/asr-ears.js` | `ac88b0fa5e234a18893dd9b428efeb5a8b86be1d0da91ba7646c2b4b09f6c737` | `70cd758ee2419d0d95d299ef516b2f4bbdfde816a9b5da3d83f82da98bc3f098` | `a582d5013474118a8d353e90d8884990f398d300dc2424482587515f80353445` |
| `tiny-speech/browser/asr-worker.js` | `e0c5de1445efd3dbfc368c82ecd990a2ee7e7393dac9a8e10c4d3adf337f7c6a` | `e486cc1ac8fa5213636e849c71e1b2f0095202de9258632ee05e1cf5f3dcc187` | `a07626d386947bbe06c05335fb9eeee09f95628ce63f2def31c15bf7c83f7d07` |
| `page5/ask.js` | `4224263859feee69e1674cdfb76a5d29e199bf3af22289037eeffbcd8c040558` | `4f95373127c03a2e0f38c9609fcad54bc32064e0093f8027280f1d96d8bc078b` | `4f95373127c03a2e0f38c9609fcad54bc32064e0093f8027280f1d96d8bc078b` |
| `page5/index.html` | `ae4b13385106a8cf297db728f104a84c5b0f4046172d984ea5f18ae1f0c60564` | `86048df7c0152f0215fb5057d645832a04abdb7b74e446b82c795e666192f755` | `9d0de4b150ac7972c602e60c0f89ef037f2f35e874f8bd6151bd6acd545368b1` |

The live files must all be in the update-4 column, or all in the update-5 column. A mix, or anything else: **stop** and report (someone
changed the site). In the repository the names file is `tiny-speech/packs/dist/mx-sma/ears-names.json`; on the site `packs/dist/` is
`packs/`, as for the word lists.

## Steps

```sh
C=https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/e5d6b70262c93a80dd892d03ebd2fdff5856c2ff
curl -fsSL "$C/tiny-speech/engines/ears-spot.js" -o /tmp/ears-spot.js
curl -fsSL "$C/tiny-speech/packs/dist/mx-sma/ears-names.json" -o /tmp/ears-names.json
curl -fsSL "$C/tiny-speech/engines/asr-ears.js" -o /tmp/asr-ears.js
curl -fsSL "$C/tiny-speech/browser/asr-worker.js" -o /tmp/asr-worker.js
curl -fsSL "$C/mapsma/page5/ask.js" -o /tmp/page5-ask.js
curl -fsSL "$C/mapsma/page5/index.html" -o /tmp/page5-index.html
sha256sum /tmp/ears-spot.js /tmp/ears-names.json /tmp/asr-ears.js /tmp/asr-worker.js /tmp/page5-ask.js /tmp/page5-index.html   # the "after" values

WEBROOT=/the/same/web/root/as/before
E="$WEBROOT/tiny-speech/engines" P="$WEBROOT/tiny-speech/packs/mx-sma"
sha256sum "$E/asr-ears.js" "$WEBROOT/tiny-speech/browser/asr-worker.js" "$WEBROOT/page5/ask.js" "$WEBROOT/page5/index.html"
ls -l "$E/ears-spot.js" "$P/ears-names.json" 2>&1; sha256sum "$E/ears-spot.js" "$P/ears-names.json" 2>/dev/null
# all "update 4" (the two new files absent) or all "update 5" (both present, with those values)
```

If a download differs, stop and ask. If the live files are not all update 4 or all update 5, stop and report. Otherwise:

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
sudo cp -p "$E/asr-ears.js" "$HOME/mapsma-asr-ears-before-learn-$TS.js"
sudo cp -p "$WEBROOT/tiny-speech/browser/asr-worker.js" "$HOME/mapsma-asr-worker-before-learn-$TS.js"
sudo cp -p "$WEBROOT/page5/ask.js" "$HOME/mapsma-page5-ask-before-learn-$TS.js"
sudo cp -p "$WEBROOT/page5/index.html" "$HOME/mapsma-page5-index-before-learn-$TS.html"
[ -e "$E/ears-spot.js" ] && sudo cp -p "$E/ears-spot.js" "$HOME/mapsma-ears-spot-before-learn-$TS.js"
O1=$(stat -c %U:%G "$E/asr-ears.js"); O2=$(stat -c %U:%G "$P/ears-lexicon-en.json")
sudo install -o "${O1%:*}" -g "${O1#*:}" -m 644 /tmp/ears-spot.js "$E/ears-spot.js"          # new (or replaced) first: nothing uses it yet
sudo install -o "${O2%:*}" -g "${O2#*:}" -m 644 /tmp/ears-names.json "$P/ears-names.json"
sudo cp /tmp/asr-ears.js "$E/asr-ears.js"                                                    # keeps its owner and mode
sudo cp /tmp/asr-worker.js "$WEBROOT/tiny-speech/browser/asr-worker.js"
sudo cp /tmp/page5-ask.js "$WEBROOT/page5/ask.js"
sudo cp /tmp/page5-index.html "$WEBROOT/page5/index.html"                                    # last: the page only now asks for any of it
for u in tiny-speech/engines/ears-spot.js tiny-speech/packs/mx-sma/ears-names.json tiny-speech/engines/asr-ears.js \
  tiny-speech/browser/asr-worker.js page5/ask.js page5/; do curl -s "https://mapsma.com/$u" | sha256sum; done   # all six: the "after" values
```

Each step leaves a working site: the old page ignores the new files, and the new worker behaves as before until the new page asks
for names. Going back: copy the backups to where they came from; new files can stay (nothing else asks for them).

## Report, and the owner's check

Report the backups' paths and the six check lines. Then tell the owner: close the /page5 tab and open https://mapsma.com/page5/ again
(English):

1. Ask "Is Estoril open?" in your own voice. Either Estoril's card comes with "Heard as Estoril" under the question, or "I didn't catch
   the place's name. Did you mean:" with Estoril among the buttons.
2. If there were buttons, tap Estoril: under that row, "I'll remember how you say Estoril, on this phone."
3. Ask "Estoril, when is it open?" (or the first question again): now Estoril should be answered directly.
4. Voice settings: "MapSMA has learned how you say 1 name, on this phone. Forget them".

To measure your own voice: record the 80 questions (40 names, two questions each) at
https://larsboesen-prog.github.io/tiny-speech/record-names/ and hand the saved file to Claude on the page it gave (a test set only,
never training, never published).
