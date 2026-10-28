# Investigate bookings displayed one day off

## Reports

**3 unique reports from #4471:** R-41202, R-41209, R-41620.
Grouped by the reported symptom, not a proven shared root cause.

R-41202:

> Invite says Tuesday 12 May. Calendar says Monday 11 May. My client turned up on the Monday. We had coffee.

R-41209:

> Every booking in June is one day off. Only June. Why only June.

R-41620:

> Tuesday 6 October showed as Monday. I moved it myself. I have stopped reporting these but my colleague says it helps you.

## Problem to investigate

These describe a one-day or weekday discrepancy, not an explicit day/month swap.
The export assigns them to the parser solely from tenant settings and channel.
That does not establish their actual cause.

## Investigation

Recover the intended booking, stored date/time, invite, and displayed calendar
value for each report. Compare date-only handling, zones, and the original input.
Do not assume DST or a shared cause from these descriptions.

Done when each discrepancy is explained and any confirmed defect has a
reproduction and regression test. Split this investigation if distinct mechanisms
emerge.

## Counting and evidence

These three reports are excluded from the revised parser draft. They appear in
`src/lib/data/desk-notes.json`; their ID lines in
`src/lib/data/reports-4471.json` are 31, 115, and 5967.
Paths are relative to the original `support-kb/` export.

Investigation. Root cause unknown. Snapshot: 2026-10-04.


[KB review page source](https://github.com/clentfort/mega-dev/blob/main/s01e03/kb-site/src/routes/kb/incidents/4471-review/+page.svx) · [Report evidence](https://github.com/clentfort/mega-dev/blob/main/s01e03/analysis.json)
