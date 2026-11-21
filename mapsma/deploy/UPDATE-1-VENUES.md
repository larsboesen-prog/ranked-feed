# MapSMA /page5 update 1: the live music venues (for a Claude session with server access)

The owner asked /page5 "Where is Johnny's piano bar" and got four other bars: Johnny's Piano Bar, Mama Mía, Raindog Cantina and
Casa Europa are not in the site's own data (`places.js`). This update adds them to /page5 only, as extra places (listed, not
recommended), from a small new file. Two files in `page5/`; nothing else changes. Same rules as `FOR-CLAUDE.md` (the first deploy,
done 21 Nov 2026 22:45 UTC): delete nothing, no server configuration change, no restart.

| File on the site | Change | SHA-256 after |
|---|---|---|
| `page5/index.html` | replaced | `99a039ca3290401d0873598e05d733e8de29dd051be3d2b87f831df690c68a52` |
| `page5/venues.js` | new | `3c19a866153c7104d93020742721eeac4da556f5fc3e2f2e94f519be9a6ca6e1` |

## Steps

```sh
B=https://raw.githubusercontent.com/larsboesen-prog/ranked-feed/claude/tiny-speech-bilingual-v7lyp0/mapsma/page5
curl -fsSL "$B/index.html" -o /tmp/page5-index.html && curl -fsSL "$B/venues.js" -o /tmp/page5-venues.js
sha256sum /tmp/page5-index.html /tmp/page5-venues.js            # must be 99a039ca… and 3c19a866… as above

WEBROOT=/the/same/web/root/as/the/first/deploy
sha256sum "$WEBROOT/page5/index.html"                            # must be b0f2bd2596fcc10eef2f52850589e6a891aeb82b23bf1c31c6593494d32fbbdb
```

If the downloaded files differ, the branch moved on: say so and ask. If the live `index.html` differs from `b0f2bd25…`, someone
changed /page5 since the first deploy: **stop** and report. Otherwise:

```sh
TS=$(date -u +%Y%m%dT%H%M%SZ)
sudo cp -p "$WEBROOT/page5/index.html" "$HOME/mapsma-page5-index-before-venues-$TS.html"
OWNER=$(stat -c %U:%G "$WEBROOT/page5/index.html")
sudo cp /tmp/page5-index.html "$WEBROOT/page5/index.html"          # keeps the file's owner and mode
sudo install -o "${OWNER%:*}" -g "${OWNER#*:}" -m 644 /tmp/page5-venues.js "$WEBROOT/page5/venues.js"
curl -s https://mapsma.com/page5/ | sha256sum                      # 99a039ca…
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://mapsma.com/page5/venues.js   # 200, a JavaScript type
curl -s https://mapsma.com/page5/venues.js | sha256sum             # 3c19a866…
```

Going back: `sudo cp "$HOME/mapsma-page5-index-before-venues-$TS.html" "$WEBROOT/page5/index.html"` (venues.js can stay; nothing
else reads it).

## Report, and the owner's check

Report the backup's path and the three check lines. Then tell the owner: open https://mapsma.com/page5/ (close the tab and open it
again if it shows the old page) and ask "Where is Johnny's Piano Bar?": the answer names Johnny's Piano Bar with its hours (it opens
at 18:00 most evenings), and its card shows Mesones 101. "Is Raindog Cantina open?" and, on ES, "¿Dónde está Mama Mía?" work the
same way.
