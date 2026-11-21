# Deploy MapSMA /page5 to mapsma.com: instructions for a Claude session with server access

You are deploying an update the site's owner has approved: /page5 ("Ask by voice") switches to MapSMA's own small models: the
**tiny ears** (speech to text, 8.9 MB) and the **MX1 voice** (text to speech, 8 MB), English and Mexican Spanish. The work was
built and tested in another session that cannot reach the server. Your job is only to put the files on the server, check them
and report. Static files only: no build, no server restart, no configuration change.

## What changes on the site

| Path on the site | Change |
|---|---|
| `page5/index.html`, `page5/ask.js`, `page5/words.js`, `page5/rules.js`, `page5/susan.js` | replaced (5 files) |
| `descs.js` (web root, next to `places.js`) | new |
| `tiny-speech/` (web root) | new folder, 77 files, about 18 MB: the shared core, both models, San Miguel's word list, licences |

Nothing else changes. Leave everything else alone: `places.js`, `photos/`, `page2/` and the other pages, and in `page5/` the
files not listed (`read.js`, `listen.js`, `spanish.js`, `facts.js`, `pcm-worklet.js`, the old `asr-worker.js`, `tinyvoca-worker.js`,
`tinyvoca/`). The new page still uses some of these, and the old ones are the way back.

## Do not

- Do not delete anything, and do not use `rsync --delete`.
- Do not change the nginx configuration or restart or reload nginx; static files need none of that. If a check below fails in a
  way only a config change would fix, stop and ask the owner.
- Do not deploy `/page2`: it has its own change waiting, not part of this one.
- Do not overwrite a /page5 that has changed since 18 Nov 2026 (step 2 checks this): stop and report instead.

## 1. Get the files (wherever you have git; the repository is public)

```sh
git clone --depth 1 --branch claude/tiny-speech-bilingual-v7lyp0 https://github.com/larsboesen-prog/ranked-feed /tmp/mapsma-src
cd /tmp/mapsma-src && sh mapsma/deploy/build.sh /tmp/mapsma-deploy/      # the trailing / gives a folder (or …/x.zip for a zip)
```

This gives `/tmp/mapsma-deploy/` with `mapsma.com/` (the files, laid out as on the site), `SHA256SUMS` (every one of them),
`backup/page5/` (the live files they replace) and `DEPLOY.txt` (the owner's notes). Needs `git`, `tar`, `sha256sum` (and `zip` only
for a zip). If you build on another machine, copy the folder to the server (`rsync -a /tmp/mapsma-deploy/ server:/tmp/mapsma-deploy/`).

Check the build gave the reviewed files:

```sh
cd /tmp/mapsma-deploy && grep -E " (page5/index.html|tiny-speech/engines/ears/ears-int8-2026-11-20.onnx|tiny-speech/vendor/tiny-voca/tiny-voca-mx1-2026-11-21.gguf)$" SHA256SUMS
```

| File | SHA-256 |
|---|---|
| `page5/index.html` | `b0f2bd2596fcc10eef2f52850589e6a891aeb82b23bf1c31c6593494d32fbbdb` |
| `tiny-speech/engines/ears/ears-int8-2026-11-20.onnx` | `8dee5a57cf6db288a567c067315b4812e7a2f961e21e49475d655f1306f4cb77` |
| `tiny-speech/vendor/tiny-voca/tiny-voca-mx1-2026-11-21.gguf` | `921d4f8406fd7f988541c5a5487e5b8712740440a93f2f68b836baec4e1a07c6` |

If `page5/index.html` differs, the branch has moved on since these instructions were written: say so in your report (with its
`git log -1 --format='%h %s' -- mapsma/page5/index.html`) and ask before going on.

## 2. Find the web root and check the live /page5 is the one these changes start from

```sh
sudo nginx -T 2>/dev/null | grep -nE "server_name|^\s*root " | grep -A4 -i mapsma
WEBROOT=/path/from/the/root/directive        # the folder holding page5/ and places.js
sha256sum "$WEBROOT/page5/index.html" "$WEBROOT/page5/ask.js" "$WEBROOT/page5/words.js" "$WEBROOT/page5/rules.js" "$WEBROOT/page5/susan.js"
```

They must be exactly these (the live files, unchanged since 18 Nov 2026; `backup/page5/` holds the same):

```
40a785fb0a2b7ab469917c3ab2e9319b56e55aae71f3b57c20e1d0655aa8fd29  index.html
5e9f60d21185714d7a4bc4dc8fed22f6206093f2b35ac06484b7f510d4d979ac  ask.js
035e4324220e0838390b96c8532869524282026c117d9af51230a93ab03b783a  words.js
d0301cea933f09dab8fe53fded1e7916ce48a61d8b59aefc5226be32021d26fb  rules.js
39eb71496797f75020dcfc903cced3d6bf3bb3365a7ad47f513871e64a38c5d5  susan.js
```

If any differs, someone changed /page5 after 18 Nov: **stop**, do not copy, and report which files differ.

## 3. Back up, then copy

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
sudo tar -czf "$HOME/mapsma-before-page5-$TS.tgz" -C "$WEBROOT" page5 $(cd "$WEBROOT" && ls -d descs.js tiny-speech 2>/dev/null)
OWNER=$(stat -c %U:%G "$WEBROOT/page5/index.html")
sudo rsync -a --chown="$OWNER" --chmod=D755,F644 /tmp/mapsma-deploy/mapsma.com/ "$WEBROOT/"
cd "$WEBROOT" && sha256sum -c --quiet /tmp/mapsma-deploy/SHA256SUMS && echo "all 82 files match"
```

(Without `sudo`, or with an rsync older than 3.1, copy with `cp -a` and set the owner and modes to match the existing files.)

## 4. Check over the web

```sh
for p in page5/ descs.js tiny-speech/browser/asr-worker.js tiny-speech/browser/tinyvoca-js-worker.js \
         tiny-speech/engines/ears/ears-int8-2026-11-20.onnx tiny-speech/engines/ears/vocab.json \
         tiny-speech/packs/mx-sma/ears-lexicon.json tiny-speech/vendor/tiny-voca/tiny-voca-mx1-2026-11-21.gguf; do
  printf "%-62s " "$p"; curl -s -o /dev/null -w "%{http_code} %{content_type} %{size_download}\n" "https://mapsma.com/$p"
done
curl -s https://mapsma.com/page5/ | sha256sum                                   # b0f2bd25… as above
curl -s https://mapsma.com/tiny-speech/vendor/tiny-voca/tiny-voca-mx1-2026-11-21.gguf | sha256sum   # 921d4f84…
curl -s https://mapsma.com/tiny-speech/engines/ears/ears-int8-2026-11-20.onnx | sha256sum         # 8dee5a57…
curl -s https://mapsma.com/page5/ | grep -c "Hear questions with"                # 1 or more
```

Expected: every line `200`; both workers `application/javascript` or `text/javascript` (**required**: browsers refuse module workers
served as anything else); the three SHA-256s as above. If a `.js` file comes back with another type, nginx's `mime.types` is not
loaded for this site: report it and ask the owner before changing any configuration.

If a browser with Playwright is at hand, optionally: open https://mapsma.com/page5/, expect no errors in the console, and in
Voice settings the choices "MapSMA's voice" and "MapSMA's ears". https://mapsma.com/tiny-speech/browser/check.html tests the parts
one by one.

## 5. Going back (only if the owner asks, or a check fails after copying)

```sh
sudo tar -xzf "$HOME/mapsma-before-page5-$TS.tgz" -C "$WEBROOT"      # the old page5/ files return
```

The new `descs.js` and `tiny-speech/` can stay: nothing else uses them.

## 6. Report back to the owner

In a few lines: the web root; the backup file's path; the result of `sha256sum -c` (all 82 files match, or which do not); the
`curl` table; anything that differed from these instructions. Then tell the owner what to check on the iPhone:

1. Open https://mapsma.com/page5/ (if it still shows the old page, close the tab and open it again: the phone may keep the old page
   for a while). Voice settings: "Read answers aloud with: MapSMA's voice" and "Hear questions with: MapSMA's ears".
2. English: tap the mic, ask "Is La Azotea open now?" The words appear (small letters, no punctuation), then the answer, read aloud.
3. ES: "¿Está abierta La Azotea?" and "¿Dónde hay música en vivo esta noche?", read in Spanish by the same voice.
4. How long the first answer takes the first time (about 30 MB downloads once) and the second time.

## Background, if you need it

- What was tested: `mapsma/test/` in the repository (16 tests, Chromium): the page hears a recorded Mexican Spanish question word for
  word with the ears, falls back to Whisper tiny if the ears cannot load, and reads answers with MX1 in both languages. These exact
  files were also run on top of the live site's own data in Chromium before this hand-off: both languages worked.
- The shared core is documented in `tiny-speech/browser/README.md`; the models in `tiny-speech/models/`; the change in
  `mapsma/README.md` (sections of 20 and 21 Nov 2026). The ears model is CC BY-SA 4.0 (credited in Voice settings and in
  `/tiny-speech/NOTICE`); the voice is Apache-2.0.
- onnxruntime-web (the ears' engine) loads from cdn.jsdelivr.net in the visitor's browser; the server serves only the files above.
