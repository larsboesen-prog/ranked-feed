#!/bin/sh
# The upload for mapsma.com (/page5 with MapSMA's ears and voice, /descs.js, the shared core under /tiny-speech/), from the committed
# files: sh mapsma/deploy/build.sh [out.zip | out-dir/] (a name ending in / gives a folder instead of a zip). It holds mapsma.com/ (copy its contents to the site's web root, keeping the folders),
# backup/ (the live files it replaces, as served since 18 Nov 2026), DEPLOY.txt (the steps and the checks on the phone) and
# SHA256SUMS (every file of mapsma.com/, to check on the server after copying).
set -e
ROOT=$(git rev-parse --show-toplevel)
ARG="${1:-mapsma-deploy.zip}"
OUT=$(realpath -m "$ARG")
STAGE=$(mktemp -d)
SITE="$STAGE/mapsma.com"
mkdir -p "$SITE/tiny-speech/vendor/tiny-voca" "$SITE/tiny-speech/packs" "$STAGE/backup"
cd "$ROOT"
git archive HEAD:mapsma page5/index.html page5/ask.js page5/words.js page5/rules.js page5/susan.js descs.js | tar -x -C "$SITE"
git archive HEAD:tiny-speech browser engines lang core domains apps models LICENSE NOTICE | tar -x -C "$SITE/tiny-speech"
git archive HEAD:tiny-speech/vendor/tiny-voca js LICENSE README.md tiny-voca-mx1-2026-11-21.gguf | tar -x -C "$SITE/tiny-speech/vendor/tiny-voca"
git archive HEAD:tiny-speech/packs/dist | tar -x -C "$SITE/tiny-speech/packs"
git archive --prefix=page5/ HEAD:mapsma/page5/live-2026-11-20 index.html ask.js words.js rules.js susan.js | tar -x -C "$STAGE/backup"
git show HEAD:mapsma/deploy/DEPLOY.txt > "$STAGE/DEPLOY.txt"
(cd "$SITE" && find . -type f | sort | sed "s|^\./||" | xargs sha256sum) > "$STAGE/SHA256SUMS"  # check on the server: cd <web root> && sha256sum -c SHA256SUMS
if [ "${ARG%/}" != "$ARG" ]; then  # a folder
  mkdir -p "$OUT" && cp -a "$STAGE/." "$OUT/" && rm -rf "$STAGE"
  echo "$OUT/"; find "$OUT/mapsma.com" -type f | wc -l
else
  rm -f "$OUT"
  (cd "$STAGE" && zip -q -r -X "$OUT" DEPLOY.txt SHA256SUMS mapsma.com backup)
  rm -rf "$STAGE"
  echo "$OUT"; unzip -l "$OUT" | tail -1
fi
