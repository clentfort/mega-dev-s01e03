# booking-v3 date hint conflicts with day-first tenant parsing

## Impact

**33 unique reports assigned to this cause in #4471**, received 2026-04-17 through
2026-09-22. All use the form channel:

- Alder Physio (`de-DE`): 12.
- Copper Studio (`es-ES`): 11.
- Pale Harbour (`pt-PT`): 10.

These reports are merged into #4471 but need a separate ticket and fix from the
shared-parser issue.

## Problem

The KB model gives booking-v3 a `MM/DD/YYYY` field hint, while the form interprets
the entered date in the day-first tenant's convention. Following the displayed
hint can therefore produce the wrong date.

R-41241 (Alder Physio, form channel) says:

> We had two people show up on 8 June. They were booked for 6 August.

R-41230 (Copper Studio, form channel) says:

> My client came on 1 June instead of 6 January. We sorted it out.

R-41230 was tagged `parser` at intake. The tenant runs booking-v3; this is the
hint mismatch path, not evidence that every wrong date has one shared cause.

## Reproduction scenario

Inferred from the supplied KB model; no product application runtime is included.

1. Open a booking-v3 form for Alder Physio (`de-DE`).
2. Follow the `MM/DD/YYYY` hint to enter 6 August as `08/06/2026`.
3. Observe that tenant-locale interpretation produces 8 June instead.

## Expected result

The displayed format and actual interpretation agree for the tenant. Following
the hint preserves the intended date.

## Acceptance checks

- The example preserves 6 August instead of creating an 8 June booking.
- Hint and parsing behavior agree for each affected tenant.
- Regression tests cover booking-v3 with day-first tenants and booking-v2/
  month-first controls.
- App/email reports and booking-v2 form reports are not included solely because
  they share a subject or an intake tag.

## Evidence and counting

Paths below are relative to the original `support-kb/` export.

- `src/lib/kb/causes.ts:24–42`: booking-v3 hint and tenant/channel classification.
- `src/lib/data/tenants/alder.physio.json`,
  `copper.studio.json`, `pale.harbour.json`: affected tenant settings.
- `src/lib/data/reports-4471.json:549–561`: R-41241.
- `src/lib/data/reports-4471.json:395–407`: R-41230.
- `src/lib/data/reports-4471.json:689–717`: R-41251 appears twice in the export
  but counts once.
- Repository `s01e03/analysis.json` contains all 33 IDs and source locations.

Intake tagged 18 of these reports as `hint` and 15 as `parser`. Counted by
deduplicated IDs and tenant/form/channel, not by intake labels.
These counts describe the 2026-10-04 export, not the live queue.



[KB review page source](https://github.com/clentfort/mega-dev/blob/main/s01e03/kb-site/src/routes/kb/incidents/4471-review/+page.svx) · [Report evidence](https://github.com/clentfort/mega-dev/blob/main/s01e03/analysis.json)
