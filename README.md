# MEGA.dev course work

## S01E03 — what it shows

[Challenge](https://hq.mega.dev/challenges/what-it-shows).

A review of reports merged into support ticket #4471. This repository contains
course-provided fictional support data, the proposed issue split, and a signed
knowledge-base page.

- [GitHub issues](https://github.com/clentfort/mega-dev/issues).
- [Signed .svx page](s01e03/kb-site/src/routes/kb/incidents/4471-review/+page.svx).
- [Rendered page](s01e03/rendered/kb/incidents/4471-review/index.html).
- [Desktop preview](s01e03/page-desktop.png).
- [Review and counting](s01e03/ANALYSIS.md).

## Run locally

Requires Node.js 24.

```sh
cd s01e03/kb-site
npm ci --ignore-scripts
npm run check
npm run build
npm test
npm run preview
```

Open http://127.0.0.1:4173/kb/incidents/4471-review/.
The rendered site is also checked in under `s01e03/rendered/`.
To serve it without installing dependencies:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory s01e03/rendered
```

## Report split

| Problem | Unique reports |
| --- | ---: |
| Day/month parser swap | 374 |
| booking-v3 format hint mismatch | 33 |
| One-day/weekday discrepancies (investigation) | 3 |
| Different local days across time zones (investigation) | 1 |
| Invite reportedly arriving before booking (investigation) | 1 |
| Total | 412 |

The later course engineering update reports #4471 closed on 2026-10-05:
issue #1 is fixed; issue #2 is not planned because booking-v3 was retired.
The three investigation issues remain open.

These counts describe the 2026-10-04 export, not a live support queue. The last
three tickets describe unresolved symptoms, not confirmed root causes. The
original classifier's assignments remain visible on the KB page.
