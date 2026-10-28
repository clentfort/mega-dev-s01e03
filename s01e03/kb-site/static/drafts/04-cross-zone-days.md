# Investigate different displayed days for the same meeting across time zones

## Report

**1 unique report from #4471:** R-41344.

> Client in Lisbon got Tuesday. Client in Toronto got Monday. Same meeting. We held it twice.

## Problem to investigate

The reporter says differing calendar days led to the same meeting being held
twice. The export does not establish whether the invitations represented
different instants or correctly displayed one instant in different time zones.

Different local days can be legitimate. This is not yet a confirmed time-zone bug.

## Investigation

Recover both invitations, the intended event and zone, and the participants'
display settings. Check whether both invitations identify the same instant and
clearly communicate the relevant zone.

Done when the discrepancy is explained. If behavior is correct, document it and
assess whether clearer presentation is needed; if not, reproduce and test the
confirmed defect.

## Counting and evidence

Excluded from the revised parser draft and the one-day-shift investigation.
Source: `src/lib/data/reports-4471.json:2005–2017`, R-41344, and
`src/lib/data/desk-notes.json` in the original `support-kb/` export.

Investigation. Root cause unknown. Snapshot: 2026-10-04.


[KB review page source](https://github.com/clentfort/mega-dev/blob/main/s01e03/kb-site/src/routes/kb/incidents/4471-review/+page.svx) · [Report evidence](https://github.com/clentfort/mega-dev/blob/main/s01e03/analysis.json)
