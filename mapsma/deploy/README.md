# Deploying MapSMA changes (the owner's server session applies them)

| File | What | State |
|---|---|---|
| `FOR-CLAUDE.md` | the first deploy: /page5 with the ears and MX1, `/descs.js`, `/tiny-speech/` | live 21 Nov 2026 22:45 UTC |
| `UPDATE-1-VENUES.md` | /page5: the four music venues (`page5/venues.js`) | live 22 Nov ~01:00 UTC |
| `UPDATE-2-ASK.md` | /page2 and /page3: Ask in the menu; /page2's shuffle, Susan York's latest reviews, descriptions | live 22 Nov ~01:00 UTC |

Each update names every file with its SHA-256 before (what the live file must be, else stop) and after. **Next time: link to files by
commit** (`https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/<commit>/mapsma/...`), not by branch: GitHub caches branch
links for up to 5 minutes, and on 22 Nov it served the server session an older UPDATE-2 with the newer files, so its checks stopped
it (correctly) until the owner confirmed.
| `UPDATE-3-WORDS.md` | the ears' word lists grown (venues, nightlife…), leaning to the page's language; the reminder to switch | live 22 Nov |
| `UPDATE-4-ENGLISH-EARS.md` | the retrained ears (English 67% → 88%), /page5 and the config pointing at them | live 22 Nov (page5 `ae4b1338…`) |
| `UPDATE-5-NAMES.md` | names by sound: a place name said with an accent still found, or offered as buttons | not applied; update 6 contains it |
| `UPDATE-6-LEARN.md` | update 5 plus learning from picks: a name picked under "Did you mean" is remembered on the phone | waiting |
