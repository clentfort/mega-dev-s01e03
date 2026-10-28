# Review of #4471

## Findings

The 2026-10-04 export contains 427 rows but 412 unique report IDs.
The 15 repeated rows have identical content.

The exported classifier assigns 379 reports to `parser` and 33 to `hint`.
It uses tenant locale, form version, and channel—not the report body. Intake tags
are browser-based guesses; 38 disagree with the classifier.

Reviewing the five bodies flagged in `desk-notes.json` gives this proposed split:

| Issue | Reports | Status |
| --- | ---: | --- |
| [Parser swaps day and month](https://github.com/clentfort/mega-dev/issues/1) | 374 | Mechanism described by KB |
| [booking-v3 hint mismatch](https://github.com/clentfort/mega-dev/issues/2) | 33 | Mechanism described by KB |
| [One-day/weekday discrepancies](https://github.com/clentfort/mega-dev/issues/3) | 3 | Investigation |
| [Different local days](https://github.com/clentfort/mega-dev/issues/4) | 1 | Investigation |
| [Invite before booking](https://github.com/clentfort/mega-dev/issues/5) | 1 | Investigation |

Each report belongs to exactly one proposed issue. These are not independently
reproduced product failures; the export contains no runnable booking application.
Investigation groups describe symptoms and can change when evidence arrives.
Different local days across time zones may be correct behavior.

## Counting

`analysis.json` preserves the original assignments in `groups`/`kbCause` and
the reviewed split in `draftGroups`/`draftProblem`. It includes every report ID,
source line, tenant settings, and source hashes.

`report-review.json` records the five reviewed assignments and exact bodies.
The script fails if a reviewed body changes or assignments overlap.

```sh
node s01e03/analyze-reports.mjs
node --test s01e03/analyze-reports.test.mjs
```

## Why the existing KB needs review

The incident prose says one issue and one fix, but its executable table shows
different mechanisms. The form hint and shared parser need separate fixes.

Subject-only merging is not reliable: 10 of 12 normalized subject buckets contain
both modeled causes. DedupeExplorer also shows that the same subject can conceal
different causes and different subjects can share one cause. Unknown context
does not justify merging.

The week of 2026-06-29 has 189 merges but only 15 receipts. That is a filing spike,
not 189 new reports or the start of the defect. Reports began arriving on April 1.

The accepted triage page and decision were last reviewed in June 2024.
Accepted or known status does not prove current correctness.

## KB page

Source: `kb-site/src/routes/kb/incidents/4471-review/+page.svx`.

It retains the original runbook style, shows computed counts and expandable
evidence, and links to the five issues. The original CauseTable, DedupeExplorer,
and QueueTimeline remain visible. The index discovers the page automatically.

The frontmatter carries the course-issued ticket as its exact `signature`, with
Pi identified separately as author. RenderStamp derives the desk reference from
that signature; this is the course's page-attribution mechanism.

The rendered site, source copy, and build hashes are in `rendered/`.
Build and render tests cover the signature, counts, source links, and output
hashes. Browser checks cover evidence expansion and reactive deduplication.

## Engineering update

The course's challenge page subsequently reports #4471 closed on 2026-10-05.
The parser was fixed (`fix(dates): parse dd/mm for eu locales`); the hint was
marked won't fix because booking-v3 was retired. Issue #1 is closed as completed;
issue #2 is closed as not planned. The three investigations remain open because
this update does not establish their causes.

The signed page records this later update separately from the older count
snapshot; the original export is unchanged.

## Follow-up

Gather the evidence requested in the investigation issues. Reconcile newer desk
data before relying on this snapshot as the current queue.

If the proposed triage change is accepted, add a replacement decision record and
update the triage/incident guidance. Accepted decision 0001 is preserved unchanged.
