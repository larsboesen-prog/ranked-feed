# Project memory: tiny-speech, MapSMA and CredBrief (last updated 19 Nov 2026)

Read this first when picking the work back up. The detailed plan, decisions and measurements are in
`tiny-speech/ARCHITECTURE.md`; this file is the short version: what exists, what is waiting, what not to do.

## What this is

**tiny-speech** (`tiny-speech/`) is a small, private, in-browser voice core shared by the owner's sites **MapSMA**
(mapsma.com, restaurants, bars and sights in San Miguel de Allende; voice Q&A on /page5) and **CredBrief** (credbrief.com,
news Q&A on /page40). English and Mexican Spanish in and out. Flow: hear the question (Whisper tiny today) → decide the
language → a deterministic reader turns words into a request (no LLM at run time) → answer from the city's data → speak it
(tiny-voca, github.com/n4ze3m/tiny-voca, credited). Cities are data ("packs"), so a new city needs no code and no training.
`mapsma/` holds changes for the MapSMA site itself, whose source is not in any connected repository.

Work happens on branch `claude/tiny-speech-bilingual-v7lyp0` of `larsboesen-prog/ranked-feed` (public). No pull request
unless the owner asks. Commits end with the two attribution lines the session gives.

## Done (all on the branch, 109 tiny-speech tests + 2 mapsma tests passing)

- Plan steps B0–B13 (ARCHITECTURE.md section 11): golden answers from /page5 (the code still reproduces them with the
  imported pack), city packs (San Miguel `mx-sma`, a made-up second city), pack loader, language decision, Spanish sound
  rules, plain-JS tiny-voca voice (8 MB instead of ~63 MB), site configs, self-hosting manifest, sizes, a small news domain.
- Live music (B8): `domains/music/`, San Miguel `music.json` with Mama Mía, Raindog Cantina, Johnny's Piano Bar (nights from
  2025 listings: answers say "worth confirming"), Casa Europa as a sight.
- Concept words and misheard-name aliases: questions understood 98/100/98% (en/es/mixed), names found 96%;
  `test/golden/approved.json` gates any answer that differs from /page5.
- Name-hint guard in `browser/asr-worker.js` (hintWentWrong): a hinted answer that loops or copies the names is heard again
  without the hint (synthetic test: 52.8% → 38.7% words wrong).
- MapSMA /page2: cards in a new random order each visit (sights fixed): `mapsma/page2/index.html` + `shuffle.patch`,
  **not deployed** (the owner deploys).

## Waiting on the owner

- **Deploy**: the shared core to mapsma.com (`tiny-speech/browser/README.md`) and `mapsma/page2/index.html`.
- **Bilingual voice (tiny-voca, ~8 MB, one voice for EN + ES)**: recording kit ready (`tiny-speech/training/record/`,
  consent form, 500 sentences); GPU pipeline ready and dry-run on CPU (`tiny-speech/training/gpu/`, ~7–9 GPU h, $5–12, or
  free on Kaggle with small changes not yet made). Until it passes its gates, Spanish answers use the phone's Mexican voice
  (decision D7). Alternative discussed: a standard Piper es_MX voice (claude or ald, ~63 MB, clean licences); do NOT use
  Piper "Laura" (CC BY-NC, unknown speaker).
- **Ears (speech to text) are ON HOLD** (owner, 19 Nov 2026). The owner's real goal: a bilingual EN/ES-MX recognizer of
  **8–10 MB** for restaurant and event questions. Whisper tiny cannot reach that (39M params, ~40 MB at 8 bits), so the
  Whisper fine-tune kit in `tiny-speech/training/asr/` (3,892 restaurant requests, 48 speaker packets, Piper and made-up
  voices, fine-tune + 8-bit export) is parked. The 8–10 MB route: a tiny bilingual phone recognizer (~5–8M params) +
  matching against a word list built from the city pack (Snips/Sonos pattern), see the "Ears probe" section below.
  Before any training, measure stock models on 5–10 real Mexican speakers.
- Questions open: GPU rental or Kaggle for the voice; whether sights on /page2 should shuffle too.

## Measurements to remember

- Stock Whisper tiny on 144 synthetic Mexican restaurant requests (Piper voices): 41.1% words wrong, 34.7% understood as said,
  places found 62.5%; with the sites' name hint 52.8% wrong; with hint + guard 38.7% / 36.1%.
- Sizes (docs/sizes.md): MapSMA English first visit 129.7 MB today, 74.6 MB with the plain-JS voice; target with both languages
  about 77 MB raw / 38 MB compressed.
- OpenRouter (build-time only, key injected by the proxy, owner's cap $15, code stops at $14): **$7.32 spent**
  (`tiny-speech/training/costs.jsonl`).

## Decisions (ARCHITECTURE.md section 0 has them all)

D1 browser first, app later · D2 language per question with manual override · D3 one shared core · D4 build around tiny-voca ·
D5 music = live music venues · D6 cities are data · D7 Spanish answers in the phone's Mexican voice until the bilingual voice
passes · D8 music venues from Google Maps' top five or the owner's picks · D9 up to $15 OpenRouter.
On hold: next city; fixing /page5's known faults ("wait"); the ears.

## Working in this environment (cloud container, reclaimed when idle)

- Tests: `cd tiny-speech && NODE_PATH=/opt/node-tools/node_modules node --test "test/*.test.mjs"`;
  `NODE_PATH=/opt/node-tools/node_modules node --test "mapsma/test/*.test.mjs"` from the repo root.
- Node network calls need `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`; Python Hugging Face downloads
  need `HF_HUB_DISABLE_XET=1` (the Xet host is blocked) and `REQUESTS_CA_BUNDLE=/root/.ccr/ca-bundle.crt`.
- Model files are gitignored: `npm run fetch:voice`, `npm run fetch:voice-orig` (in tiny-speech/).
- Not reachable from here: datacollective.mozillafoundation.org (Common Voice downloads), download.pytorch.org (use PyPI torch).
- Lost when the container goes (regenerate if needed): the Python venv with torch, the Piper voices and 2,694 synthetic clips
  (`training/asr/synth_piper.py` resumes), the CPU dry-run of the GPU pipeline (`training/gpu/SMOKE.md` says what passed).
- In this Chromium, Playwright routes stop module workers with nested imports: serve test files from the test server instead.
