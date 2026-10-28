# Support KB renderer

This working copy adds a signed review page to the course's knowledge-base export.
The unmodified export is retained in `../kb-export/support-kb/`.

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm test
npm run preview
```

Open http://127.0.0.1:4173/kb/incidents/4471-review/.
Stop the preview before rebuilding, then restart it.

- Page source: `src/routes/kb/incidents/4471-review/+page.svx`.
- Rendered site and source copy: `../rendered/`.
- Review evidence: `../report-review.json`.
- Issue texts: `../drafts/issues/`; `npm run sync` copies these into static assets.

Counts are computed from report IDs and tenant settings, with explicit reviewed
overrides. The page shows both the original classification and the proposed
issue split. Existing pages and accepted decision records are unchanged.

Dependency versions are pinned. npm audit currently reports four low-severity
entries propagated from deepmerge through development tooling; the preview
listens only on loopback.
