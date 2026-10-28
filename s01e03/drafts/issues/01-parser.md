# Shared date parser treats day-first tenant dates as MM/DD

## Impact

**374 unique reports from #4471**, across 11 tenants, received
2026-04-01 through 2026-10-04. Counted by report ID, not export rows or intake tags.

The original KB model assigns 379 reports here. Our review moves five reports
into separate investigation drafts because their bodies describe other symptoms.
The remaining group contains 202 app, 147 email, and 25 booking-form reports.
These are review assignments, not independently verified reproductions.
See [the split and investigation drafts](https://github.com/clentfort/mega-dev/blob/main/s01e03/drafts/anomaly-review.md).

## Problem

The shared parser reads dates month first, even when the tenant's date convention
is day first. Ambiguous dates therefore become a different calendar date.

For example, R-41205 (Morrow Tax, tenant locale `fr-FR`, app channel) says:

> Customer booked 3 October and got an invite for 10 March. Please look at this.

Its browser locale is `en-US` and intake tagged it `hint`, but neither describes
the tenant's date convention or identifies the responsible path. R-41200
(Harbour Dental, `en-GB`, app) independently reports 7 April becoming 4 July.

## Reproduction scenario

Inferred from the supplied KB model; no product application runtime is included.

1. Use a day-first tenant, such as Morrow Tax (`fr-FR`).
2. Enter 3 October as `03/10/2026` through the affected shared-parser path.
3. Observe that the invite interprets it as 10 March rather than 3 October.

## Expected result

Preserve the intended date using the tenant's date convention. Do not select
date order from the reporting browser or the intake guess.

## Acceptance checks

- The example preserves 3 October through booking and invite generation.
- Ambiguous day-first dates do not swap day and month on affected paths.
- Regression tests cover tenant/browser locale disagreement and month-first
  tenants as controls.
- The separate booking-v3 hint/parser mismatch is tracked independently.
- Keep the five reports in the separate investigation drafts out of this count;
  revise assignments if later evidence establishes their cause.

## Evidence and counting

Paths below are relative to the original `support-kb/` export.

- `src/lib/kb/causes.ts:24–42`: form hints, locale ordering, and classification.
- `src/lib/data/tenants/morrow.tax.json`: tenant locale and form.
- `src/lib/data/reports-4471.json:73–85`: R-41205.
- `src/lib/data/reports-4471.json:3–15`: R-41200.
- `src/lib/kb/CauseTable.svelte:9–11`: deduplicate IDs, then classify merged reports.
- Repository `s01e03/analysis.json` contains every assigned ID and source location;
  use `draftGroups` for reviewed counts, not the original model's `groups`.
- Repository `s01e03/report-review.json` records the five report reassignments.

Of these 374 reports, intake tagged 351 as `parser` and 23 as `hint`.
These counts describe the 2026-10-04 export, not the live queue.



[KB review page source](https://github.com/clentfort/mega-dev/blob/main/s01e03/kb-site/src/routes/kb/incidents/4471-review/+page.svx) · [Report evidence](https://github.com/clentfort/mega-dev/blob/main/s01e03/analysis.json)
