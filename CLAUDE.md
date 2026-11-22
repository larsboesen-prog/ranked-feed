# Project memory: tiny-speech, MapSMA and CredBrief (last updated 20 Nov 2026)

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

## Done (all on the branch, 118 tiny-speech tests + 24 mapsma tests passing)

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
- MapSMA (20 Nov): /page2 row "Susan York's latest reviews" (the ten newest from her blog, those open now or within two hours;
  `mapsma/page2/index.html` rebased on the 20 Nov live page, `susan.patch`, `mapsma/page5/susan.js` with `latest`), and
  descriptions for the 47 empty listings (`mapsma/listings/descriptions-2026-11-20.json`: 37 ready, 10 unconfirmed). Not deployed.
  Her Facebook (personal account, login) is unreachable; no Google Maps photos copied (owner asked; declined: copyright).
- MapSMA /page5 (20 Nov, D10): no "Not our pick" label; our picks marked "★ Our pick" (cards, detail card, lists that mix both);
  descriptions EN/ES for the 18 extra places and the 37 ready ones in `/descs.js` (`mapsma/descs.js`, built by
  `mapsma/listings/build-descs.mjs`), shown by /page2 and /page5. `mapsma/page5/` = 20 Nov live files + changes. Not deployed.
- MapSMA /page5 phone's own voice (20 Nov; owner heard nothing unless tiny-voca): media sound session + silence on the player while
  it speaks (iPhone silent switch), no speak right after cancel, waits for voices, one sentence at a time, 4 s watchdog with the
  reason (EN page: tiny-voca reads instead). `mapsma/test/page5-voice.test.mjs` (stand-in speech). Needs the owner's phone to confirm.

- MapSMA /page5 hears with the tiny ears (21 Nov, owner: "Deploy to page 5"): Whisper tiny a choice and the fallback;
  `mapsma/test/page5-ears.test.mjs`; upload zip from `sh mapsma/deploy/build.sh` (DEPLOY.txt inside). mapsma.com is nginx with no
  repository or access from here: the owner uploads. Staged over the live site's data: works in both languages.
- Sharing (21 Nov, owner: new repo, ears model CC BY-SA 4.0 with credits, a demo page): `tiny-speech/README.md` (use case,
  architecture, accuracy with the synthetic-voice caveat, limits, how to use, credits), `models/` (cards: ears.md, voice.md),
  `LICENSE` (Apache-2.0, code), `NOTICE`, `demo/` (GitHub Pages: mic → tiny ears → reader → MX1; `test/demo.test.mjs` with a
  fake microphone), `index.html` → demo/, `.nojekyll`. The ears model `engines/ears/ears-int8-2026-11-20.onnx` is now in git
  (gitignore exception). **Published 21 Nov**: https://github.com/larsboesen-prog/tiny-speech (public, `main` = `git subtree split
  --prefix=tiny-speech`, 66 commits; clone at /home/user/tiny-speech; update by splitting again and pushing). Pages:
  https://larsboesen-prog.github.io/tiny-speech/demo/ once the owner turns Pages on (Settings → Pages → main, / root); github.io
  is not reachable from this container, so the owner confirms it.

- English ears (21 Nov, owner: "understanding English is poor"; examples "where can I eat tacos now" → "we can i tacos", "is La
  Azotea open now" → "is la se"): measured 67.2% understood on 201 unheard English clips (Whisper tiny.en 61%; Spanish 87.5%);
  word-list changes moved it ≤1 point, so the sound model: it never heard an English request. **Retrain running** on Kaggle
  (`larsbo99/tiny-ears-english` v1, started 23:55 UTC, ~6 GPU h; `run.py --mode english`: Piper LibriTTS-R + VCTK read the English
  and mixed training sentences ×10, English transcripts as sounds, from `kaggle-init/ears-v2-best.fp16.pt`). Then: download the onnx,
  English test (`training/asr/probe/synth_en_test.py` set) and Spanish dev; ship only if English up and Spanish not down.
- /page5 deployed 21 Nov 22:45 UTC by the owner's server session. Update 1 (venues) and update 2 (Ask menu on /page2 and /page3,
  with the waiting /page2 changes) **live 22 Nov ~01:00 UTC** (page2 00060cfd…, page3 7e73c881…, page5 99a039ca…; checked in a browser).
  Lesson: GitHub's raw cache (5 min) served old instructions with new files: pin raw links to a commit SHA in future update files.
- Update 2 (22 Nov, owner: "Add ask icon to the main photo/map menu on page 2", then "I like ask not mic image, Voz ok for Spanish"):
  Photos | Map | Ask (Fotos | Mapa | Voz) on /page2 and /page3, /page2 rebased on the 21 Nov 23:02 live page (new SEO head) with the
  shuffle/Susan/descs. Deployed (above).
  Someone (the owner's other session?) edits the live site: always compare live checksums before building on a copy.
- Words (22 Nov): the ears' list grown to the reader's words + everyday ones (2,794; "venues" was missing), template questions at
  small weight; lists leaning to the page's language (`ears-lexicon-en|es.json`, 6x / cost 1: best of 9 settings); /page5 loads its
  language's and reminds to switch (names masked; 2 in a row or 1 clear; 0 false of 515 matched). Update 3 waiting:
  https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/e274701439fdfe3a47a5348aeda12d472a9eb9a2/mapsma/deploy/UPDATE-3-WORDS.md

## Waiting on the owner

- **Spanish tiny-voca, designed voice (owner, 20 Nov: "develop a tiny voca for Spanish output so I control the experience";
  chose a designed voice, trained free on Kaggle)**: `training/gpu/design.py` + `gpu/kaggle/voice.ipynb` (push with
  `training/ears/kaggle/push.py push design|teach|learn --kit voice --user larsbo99 [--set PICK=M1]`). Design run done (T4, fp16):
  four Mexican candidates M1/M2/F1/F2 (M1, F1 clearest; F2 one clip off), listening page with a pick button:
  https://claude.ai/artifact/HTFG2kc6T3MZuLn5u6rzHj. **Owner picked M1 ("Use local warm man")**, reference kept in
  `training/voice/M1/` (the design run ended "ERROR" at its last check, so Kaggle refused its output as input). `teach` v6 done
  (21 Nov 03:10–09:00 UTC, 2 T4s): teacher 6,941 of 7,576 accepted (~7 h), originals 1,432, annotate 7,748 train clips (MX1
  6,385), tsw.tar 4.9 GB. Fixes on the way: Kaggle pip refuses editable installs (deps only + PYTHONPATH), CUDA 12 cuBLAS/cuDNN for
  faster-whisper (nvlibs), Whisper OOM beside Qwen (empty cache + retry), always pack the work. **`learn` v1 done (21 Nov
  09:05–20:20 UTC): step 27,611/30,000; gates Spanish 96.7%, English 94.1% (pass ≥90%); the packed GGUF (7,998,304 bytes, F2/M2/MX1,
  `vendor/tiny-voca/tiny-voca-bilingual.gguf`, gitignored; from Kaggle output result.tar.gz via `node tools/voice-gguf.mjs pack
  training/result/dump`) in the browser engine: Spanish 96.5%, English 96.2%, 4× real time.** `training/voice/README.md`. Waiting:
  the owner's ear (https://claude.ai/artifact/Ep52gPWQDZjHm2DMqJKBSG): **approved 21 Nov ("Use this voice on mapsma")**. /page5 now
  reads both languages with it (D11; `mapsma/page5/index.html`, plain-JS worker under /tiny-speech/, voice file
  `vendor/tiny-voca/tiny-voca-mx1-2026-11-21.gguf` committed, test `mapsma/test/page5-mapsma-voice.test.mjs`). Not deployed;
  then the iPhone speed check.
  Phone's-own-voice check page (owner's phone diagnostics): https://claude.ai/artifact/C8AxpVGeaW3ARPHaR7Dssr (db `checks`).
- **Bilingual voice (tiny-voca, ~8 MB, one voice for EN + ES)**: recording kit ready (`tiny-speech/training/record/`,
  consent form, 500 sentences); GPU pipeline ready and dry-run on CPU (`tiny-speech/training/gpu/`, ~7–9 GPU h, $5–12, or
  free on Kaggle with small changes not yet made). Until it passes its gates, Spanish answers use the phone's Mexican voice
  (decision D7). Alternative discussed: a standard Piper es_MX voice (claude or ald, ~63 MB, clean licences); do NOT use
  Piper "Laura" (CC BY-NC, unknown speaker).
- **Ears (speech to text): the 8–10 MB route is back on (owner, 20 Nov 2026)**; the Whisper fine-tune kit in
  `tiny-speech/training/asr/` stays parked (Whisper tiny is 39M params, ~40 MB at 8 bits). The owner's goal: bilingual
  EN/ES-MX ears of **8–10 MB** for restaurant and event questions. Kit ready in **`tiny-speech/training/ears/`** (README there):
  a 7.5M-param Conformer (8.9 MB at 8 bits) trained to imitate the probe's wav2vec2 espeak teacher on ~100 h of free speech
  (CIEMPIESS Mexican Spanish, Google Latin American requests, LibriSpeech, Piper restaurant requests), one notebook
  `ears.ipynb` for Kaggle (recommended, 30 free GPU h/week) or Colab, `run.py all` resumable, export gates (≤10 MB). Checked on
  CPU here. Kaggle token saved (20 Nov) as a network secret for api.kaggle.com: `training/ears/kaggle/push.py` (push /
  status / output / quota) talks to the API directly (the kaggle CLI's token check sends the token in the body, which the
  proxy cannot fill). Account allowance: **30 GPU h/week** (kagglesdk's to_dict prints 21600s: it drops the day). Plan:
  tiny-ears-smoke (CPU) → tiny-ears-data (CPU, ~100 h speech packed in its output) → tiny-ears-train (T4, ~11 h).
  Kaggle account larsbo99 (phone-verified 20 Nov: without it Kaggle silently gives no internet). Smoke v3 passed every stage
  on Kaggle (8.88 MB, gates pass). tiny-ears-data v1 done in 1 h (CPU): 108.8 h, 60,471 clips (CIEMPIESS 50.6 h, Google
  Latin American 22.8 h, Piper requests 6.8 h, LibriSpeech 28.6 h), 51,885 clips with transcript sounds, packed 6.9 GB.
  **tiny-ears-train v2 trained (20 Nov, 10.7 GPU h): 8.9 MB; with the probe's matcher, held-out synthetic requests understood
  80.6% (teacher 58.3%, Whisper tiny 29%); two voices it never heard 85.4% (65.3%, 52.1%)** (training/ears/README.md). The run
  ended "ERROR" only at a too-strict export gate (fixed). Model on Kaggle's output, not in git (CC BY-SA training sets: the
  owner's licence decision first). **B16 done (20 Nov): the ears in the browser** — `asr-worker.js` model `tiny-ears` (matcher
  `engines/ears-match.js`, identical to probe.py on 432 sound files; `engines/asr-ears.js`; onnxruntime-web 1.18 only when asked),
  word list `packs/dist/mx-sma/ears-lexicon.json` (`tools/ears-lexicon.mjs`), config `asr.engine`/`asr.ears`/`asrModel()` (MapSMA
  ears, CredBrief Whisper; Whisper tiny stays a choice). Model file `engines/ears/ears-int8-2026-11-20.onnx` is gitignored: copy it
  from the Kaggle output for tests (`test/ears.test.mjs`). First visit 28.6 MB vs 74.6. Next: real Mexican speakers.
  Outputs download from www.kaggleusercontent.com
  (allowed on this environment): `python kaggle/push.py output larsbo99/tiny-ears-train DIR --pattern "onnx|json"`.
  Then: probe with `--onnx`, then 5–10 real Mexican speakers. Owner question: CC BY-SA training sets (credit + share alike?).
  Outside review measured (probe README): the example errors (perro→pero, frío→fino, dulce→doce) are the TEACHER's hearing,
  so training now adds CTC on the Spanish transcripts (phones.mjs; teacher 23.7% sound errors vs what was said). Learned
  pronunciation variants: worse held-out (37 vs 42 of 72); confidence-to-ask-again: weak (AUC ~0.65); endpoints fine.
  New measure in asr-eval: the thing asked for heard right: probe 63.5% vs Whisper tiny 23.1% (held-out).
- Questions open: GPU rental or Kaggle for the voice; whether sights on /page2 should shuffle too.

## Ears probe (19 Nov 2026): does "small sound recognizer + city word list" work?

`tiny-speech/training/asr/probe/` (README there). Best case: a large sound recognizer (wav2vec2 espeak, 300M) matched against
a 2,181-word list from the restaurant requests and San Miguel's pack. On 72 held-out synthetic Mexican requests it understood
**47.2%** as said vs **29–31%** for the sites' Whisper tiny, words wrong 39.8% vs 43–48%, places 9 vs 6 of 12; but language
right 80.6% vs 94–97%, and 10 of 144 answers came out empty (fixable). So the design works in the best case. Open question:
how much a tiny 5–8M sound model (the 8–10 MB target) keeps; next step if the ears resume: train it to imitate the large
one, rerun the probe, then test on 5–10 real Mexican speakers.
Drivers measured 20 Nov (probe README): keeping 256 paths instead of 48 and never answering empty raised held-out
understanding to **58.3%** (words wrong 32.7%, places 10 of 12; now probe.py's defaults). More text, more words, a three-word
model, boosting key words, a "did you mean" top 5 and a known language each moved it ≤1–2 clips. 28 of the 30 remaining
failures are words in the list misheard, and the two synthetic voices differ by 8 points: the small sound model's quality
and real speakers decide the outcome.

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
passes · D8 music venues from Google Maps' top five or the owner's picks · D9 up to $15 OpenRouter · D10 mark our picks "★ Our pick", no label on the extra places ·
D11 (21 Nov, replaces D7) MapSMA's own voice, MX1 (bilingual tiny-voca, the warm local guide), reads Spanish and English; the phone's voice stays a choice.
On hold: next city; fixing /page5's known faults ("wait"); the Whisper fine-tune (the 8–10 MB ears are on).

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
- Plain-HTTP sites (Susan York's blog, www.cupcakesandcrablegs.com: no HTTPS) work only through the proxy as a tunnel:
  `curl -p -x "$HTTPS_PROXY" http://...` (host allowed 20 Nov, with cupcakesandcrablegs.blogspot.com and wanderlog.com).
