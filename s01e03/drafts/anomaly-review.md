# Review of the five anomalous reports

The original classifier assigns all five to `parser` without reading their bodies.
The issue split instead tracks the reported symptoms:

- [One-day/weekday discrepancies](https://github.com/clentfort/mega-dev/issues/3):
  R-41202, R-41209, R-41620 — 3 reports.
- [Different local days](https://github.com/clentfort/mega-dev/issues/4):
  R-41344 — 1 report.
- [Invite before booking](https://github.com/clentfort/mega-dev/issues/5):
  R-41236 — 1 report.

These are investigation tickets, not three additional proven root causes.
Different local days across time zones may be correct behavior. The chronology
report does not establish an exact one-day difference.

The original model still produces 379 parser and 33 hint assignments. Our
proposed issues count 374 parser + 33 hint + 3 one-day + 1 cross-zone + 1 chronology
= 412, with no report counted twice.

`../report-review.json` records each override and exact report body. The analysis
preserves the original classification alongside the reviewed issue assignment.
The issue groups can change when more evidence arrives.
