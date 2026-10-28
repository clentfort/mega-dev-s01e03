import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const root = new URL('./kb-export/support-kb/', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const json = async (path) => JSON.parse(await read(path));
const importReviewedTs = async (path) => {
  const code = stripTypeScriptTypes(await read(path), { mode: 'strip' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
};

// Only the already-reviewed, self-contained classification/example modules run.
const causes = await importReviewedTs('src/lib/kb/causes.ts');
const { DEDUPE_CASES } = await importReviewedTs('src/lib/kb/dedupe-cases.ts');
const reportsText = await read('src/lib/data/reports-4471.json');
const raw = JSON.parse(reportsText);
const notes = await json('src/lib/data/desk-notes.json');
const tenantFiles = (await readdir(new URL('src/lib/data/tenants/', root)))
  .filter((name) => name.endsWith('.json')).sort();
const tenants = await Promise.all(tenantFiles.map((name) => json(`src/lib/data/tenants/${name}`)));
const byTenant = new Map(tenants.map((t) => [t.handle, t]));
const tenantOf = (r) => byTenant.get(r.tenant);
const unique = causes.uniqueById(raw);
const merged = unique.filter((r) => r.mergedInto === 4471);
const counts = (values) => Object.fromEntries([...new Set(values)].sort()
  .map((value) => [value, values.filter((x) => x === value).length]));
const sourceLines = new Map();
for (const [index, line] of reportsText.split('\n').entries()) {
  const id = line.match(/"id": "([^"]+)"/)?.[1];
  if (id) sourceLines.set(id, [...(sourceLines.get(id) ?? []), index + 1]);
}
const reviewText = await readFile(new URL('./report-review.json', import.meta.url), 'utf8');
const review = JSON.parse(reviewText);
const overrides = new Map(review.map((item) => [item.reportId, item]));
assert.equal(overrides.size, review.length, 'Duplicate reviewed report assignment');
for (const item of review) {
  assert(['one-day-shift', 'cross-zone-day', 'invite-before-booking'].includes(item.problem), 'Unknown draft problem');
  const report = merged.find((r) => r.id === item.reportId);
  assert(report, `Reviewed report missing: ${item.reportId}`);
  assert.equal(report.body, item.expectedBody, `Reviewed report changed: ${item.reportId}`);
}
const ledger = merged.map((r) => ({
  ...r,
  tenantConfig: tenantOf(r) ?? null,
  kbCause: causes.causeOf(r, tenantOf(r)),
  draftProblem: overrides.get(r.id)?.problem ?? causes.causeOf(r, tenantOf(r)),
  deskOneDayMoveNote: notes.oneDayMove.includes(r.id),
  sourceIdLines: sourceLines.get(r.id),
}));
const groups = causes.groupByCause(merged, tenantOf).map((g) => ({
  ...g,
  reports: g.reports.map((r) => r.id),
  reportCount: g.reports.length,
  byTenant: counts(g.reports.map((r) => r.tenant)),
  byChannel: counts(g.reports.map((r) => r.channel)),
  deskOneDayMoveIds: g.reports.filter((r) => notes.oneDayMove.includes(r.id)).map((r) => r.id),
}));
// Reviewed symptom assignments stay separate from the untouched KB model.
const draftGroups = [...new Set(ledger.map((r) => r.draftProblem))].map((problem) => {
  const reports = ledger.filter((r) => r.draftProblem === problem);
  return {
    problem,
    investigation: !['parser', 'hint'].includes(problem),
    reportCount: reports.length,
    reports: reports.map((r) => r.id),
    byChannel: counts(reports.map((r) => r.channel)),
    taggedAs: counts(reports.map((r) => r.meta.intakeTag)),
  };
});
const duplicateIds = [...new Set(raw.filter((r, i) => raw.findIndex((x) => x.id === r.id) !== i).map((r) => r.id))];
const conflictingDuplicateIds = duplicateIds.filter((id) => new Set(raw.filter((r) => r.id === id).map((r) => JSON.stringify(r))).size > 1);
const monthly = {};
for (const r of merged) {
  const received = r.receivedAt.slice(0, 7);
  const filed = r.mergedAt?.slice(0, 7);
  monthly[received] ??= { received: 0, merged: 0 };
  monthly[received].received++;
  if (filed) {
    monthly[filed] ??= { received: 0, merged: 0 };
    monthly[filed].merged++;
  }
}
const weeks = {};
const weekStart = (iso) => {
  const date = new Date(iso.slice(0, 10));
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
};
for (const r of merged) {
  for (const [field, at] of [['received', r.receivedAt], ['merged', r.mergedAt]]) {
    if (!at) continue;
    const week = weekStart(at);
    weeks[week] ??= { received: 0, merged: 0 };
    weeks[week][field]++;
  }
}
const dedupeCases = DEDUPE_CASES.map((c) => ({
  ...c,
  aCause: causes.causeOf(c.a, tenantOf(c.a)),
  bCause: causes.causeOf(c.b, tenantOf(c.b)),
  sameCause: causes.sameCause(c.a, tenantOf(c.a), c.b, tenantOf(c.b)),
}));
const normalizeSubject = (text) => text.toLowerCase().replace(/\p{P}/gu, '');
const subjectBuckets = Object.entries(counts(merged.map((r) => normalizeSubject(r.subject)))).map(([subject, count]) => ({
  subject, count, causes: counts(merged.filter((r) => normalizeSubject(r.subject) === subject).map((r) => causes.causeOf(r, tenantOf(r)))),
}));
const files = ['README.md', 'src/lib/data/reports-4471.json', 'src/lib/data/desk-notes.json',
  'src/lib/kb/causes.ts', 'src/lib/kb/dedupe-cases.ts', ...tenantFiles.map((name) => `src/lib/data/tenants/${name}`)];
const sourceHashes = Object.fromEntries(await Promise.all(files.map(async (path) => [path, createHash('sha256').update(await readFile(new URL(path, root))).digest('hex')])));
assert.equal(conflictingDuplicateIds.length, 0, 'Conflicting duplicate reports require review');
assert.equal(merged.length, 412, 'Unexpected snapshot size; review drafts before updating them');
assert.equal(groups.reduce((sum, group) => sum + group.reportCount, 0), merged.length);
assert.equal(draftGroups.reduce((sum, group) => sum + group.reportCount, 0), merged.length);
assert.equal(new Set(draftGroups.flatMap((group) => group.reports)).size, merged.length, 'Overlapping draft assignments');
assert.equal(new Set(ledger.flatMap((r) => r.id)).size, ledger.length);
assert(ledger.every((r) => r.tenantConfig && r.kbCause), 'Unplaced report requires investigation');
assert(notes.oneDayMove.every((id) => ledger.some((r) => r.id === id)), 'Missing desk-note report');
const result = {
  snapshot: 'Exported 2026-10-04; not a current/live desk snapshot',
  rawRows: raw.length,
  uniqueReports: unique.length,
  mergedReports: merged.length,
  duplicateRows: raw.length - unique.length,
  duplicateIds,
  conflictingDuplicateIds,
  groups,
  draftGroups,
  reviewHash: createHash('sha256').update(reviewText).digest('hex'),
  mismatchedIntakeTags: ledger.filter((r) => r.meta.intakeTag !== r.kbCause).map((r) => r.id),
  deskNoteReports: ledger.filter((r) => r.deskOneDayMoveNote),
  monthly: Object.fromEntries(Object.entries(monthly).sort()),
  weekly: Object.fromEntries(Object.entries(weeks).sort()),
  tenantDirectory: tenants.map((t) => ({ ...t, dayFirst: causes.dayFirst(t.locale) })),
  dedupeCases,
  subjectBuckets,
  sourceHashes,
  reports: ledger,
};
await writeFile(new URL('./analysis.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({
  snapshot: result.snapshot,
  rawRows: result.rawRows, uniqueReports: result.uniqueReports, duplicateRows: result.duplicateRows,
  conflictingDuplicateIds,
  groups: groups.map(({ reports, ...group }) => ({ ...group, exampleIds: reports.slice(0, 3) })),
  draftGroups: draftGroups.map(({ reports, ...group }) => ({ ...group, exampleIds: reports.slice(0, 3) })),
  mismatchedIntakeTags: result.mismatchedIntakeTags.length,
  deskNoteReports: result.deskNoteReports,
  monthly: result.monthly,
  peakReceivedWeeks: Object.entries(weeks).sort((a, b) => b[1].received - a[1].received).slice(0, 3),
  peakMergedWeeks: Object.entries(weeks).sort((a, b) => b[1].merged - a[1].merged).slice(0, 3),
  dedupeCases,
  subjectBuckets,
}, null, 2));
