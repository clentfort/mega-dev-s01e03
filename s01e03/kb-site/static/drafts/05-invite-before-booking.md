# Investigate an invite reportedly arriving before its booking was created

## Report

**1 unique report from #4471:** R-41236.

> The invite arrived before I made the booking. I would like to know how.

## Problem to investigate

The reported chronology is unexpected, but the export contains no booking or
delivery timestamps to verify it. It also does not say the invite arrived exactly
one day early, despite the desk's `oneDayMove` label.

## Investigation

Identify the booking and invitation. Compare booking creation, invite generation,
delivery headers, displayed times, and their clock/time-zone sources. Establish
what the reporter meant by “arrived before.”

Done when the sequence is explained and any confirmed defect has a reproduction
and regression test. Do not assign a parser or scheduling cause without evidence.

## Counting and evidence

Excluded from the revised parser draft and the one-day-shift investigation.
Source: `src/lib/data/reports-4471.json:479–491`, R-41236, and
`src/lib/data/desk-notes.json` in the original `support-kb/` export.

Investigation. Root cause unknown. Snapshot: 2026-10-04.


[KB review page source](https://github.com/clentfort/mega-dev/blob/main/s01e03/kb-site/src/routes/kb/incidents/4471-review/+page.svx) · [Report evidence](https://github.com/clentfort/mega-dev/blob/main/s01e03/analysis.json)
