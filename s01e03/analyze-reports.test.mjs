import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';

const root = new URL('./kb-export/support-kb/', import.meta.url);
const json = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const ts = async (path) => import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(await readFile(new URL(path, root), 'utf8'), { mode: 'strip' })).toString('base64')}`);
const causes = await ts('src/lib/kb/causes.ts');
const { DEDUPE_CASES } = await ts('src/lib/kb/dedupe-cases.ts');
const raw = await json('src/lib/data/reports-4471.json');
const notes = await json('src/lib/data/desk-notes.json');
const tenantNames = (await readdir(new URL('src/lib/data/tenants/', root))).filter((name) => name.endsWith('.json'));
const tenants = await Promise.all(tenantNames.map((name) => json(`src/lib/data/tenants/${name}`)));
const tenantOf = (r) => tenants.find((t) => t.handle === r.tenant);
const unique = causes.uniqueById(raw);
const groups = causes.groupByCause(unique, tenantOf);
const evidence = JSON.parse(await readFile(new URL('./analysis.json', import.meta.url), 'utf8'));

test('export overlap is removed by ID without conflicting versions', () => {
  assert.equal(raw.length, 427);
  assert.equal(unique.length, 412);
  assert(unique.every((r) => r.mergedInto === 4471));
  for (const r of unique) {
    assert(raw.filter((x) => x.id === r.id).every((x) => JSON.stringify(x) === JSON.stringify(r)));
  }
  assert.equal(evidence.duplicateRows, 15);
});

test('tenant date order comes from locale, not intake browser metadata', () => {
  assert.equal(tenants.length, 11);
  assert(tenants.every((t) => causes.dayFirst(t.locale)));
  assert.equal(causes.dayFirst('en-GB'), true);
  assert.equal(causes.dayFirst('en-US'), false);
  const r = unique.find((r) => r.id === 'R-41205');
  assert.equal(r.meta.browserLocale, 'en-US');
  assert.equal(tenantOf(r).locale, 'fr-FR');
  assert.equal(causes.causeOf(r, tenantOf(r)), 'parser');
});

test('form version and channel distinguish hint from shared-parser reports', () => {
  const v3 = tenantOf({ tenant: 'alder.physio' });
  const v2 = tenantOf({ tenant: 'morrow.tax' });
  assert.equal(causes.causeOf({ channel: 'form' }, v3), 'hint');
  assert.equal(causes.causeOf({ channel: 'app' }, v3), 'parser');
  assert.equal(causes.causeOf({ channel: 'email' }, v3), 'parser');
  assert.equal(causes.causeOf({ channel: 'form' }, v2), 'parser');
  assert.equal(causes.causeOf({ channel: 'form' }, { ...v3, locale: 'en-US' }), null);
  assert.equal(causes.causeOf({ channel: 'email' }, undefined), null);
});

test('all 412 assignments reconcile with the tenant/form/channel rule', () => {
  const expected = { parser: 0, hint: 0 };
  for (const r of unique) {
    const t = tenantOf(r);
    assert(t);
    // All exported tenants are day-first; independently count the v3 form path.
    const cause = t.form === 'booking-v3' && r.channel === 'form' ? 'hint' : 'parser';
    expected[cause]++;
    assert.equal(causes.causeOf(r, t), cause);
  }
  assert.deepEqual(expected, { parser: 379, hint: 33 });
  assert.deepEqual(Object.fromEntries(groups.map((g) => [g.cause, g.reports.length])), expected);
  assert.equal(new Set(groups.flatMap((g) => g.reports.map((r) => r.id))).size, 412);
});

test('38 intake labels disagree with computed assignments', () => {
  const parser = groups.find((g) => g.cause === 'parser');
  const hint = groups.find((g) => g.cause === 'hint');
  assert.deepEqual(parser.taggedAs, { parser: 356, hint: 23 });
  assert.deepEqual(hint.taggedAs, { parser: 15, hint: 18 });
  assert.equal(evidence.mismatchedIntakeTags.length, 38);
});

test('source model still assigns all five flagged bodies to parser', () => {
  assert.equal(notes.oneDayMove.length, 5);
  assert.deepEqual(evidence.deskNoteReports.map((r) => r.id), notes.oneDayMove);
  assert(evidence.deskNoteReports.every((r) => r.kbCause === 'parser'));
  assert.equal(groups.find((g) => g.cause === 'parser').reports.filter((r) => notes.oneDayMove.includes(r.id)).length, 5);
});

test('five local drafts partition all 412 reports without changing the source model', async () => {
  const expected = { parser: 374, hint: 33, 'one-day-shift': 3, 'cross-zone-day': 1, 'invite-before-booking': 1 };
  assert.deepEqual(Object.fromEntries(evidence.draftGroups.map((g) => [g.problem, g.reportCount])), expected);
  const ids = evidence.draftGroups.flatMap((g) => g.reports);
  assert.equal(ids.length, 412);
  assert.equal(new Set(ids).size, 412);
  assert.deepEqual([...ids].sort(), unique.map((r) => r.id).sort());
  const reviewText = await readFile(new URL('./report-review.json', import.meta.url), 'utf8');
  const review = JSON.parse(reviewText);
  assert.equal(review.length, 5);
  assert.equal(evidence.reviewHash, createHash('sha256').update(reviewText).digest('hex'));
  for (const r of evidence.reports) {
    const override = review.find((item) => item.reportId === r.id);
    assert.equal(r.draftProblem, override?.problem ?? r.kbCause);
    if (override) assert.equal(r.body, override.expectedBody);
  }
  assert.deepEqual(evidence.draftGroups.find((g) => g.problem === 'one-day-shift').reports, ['R-41202', 'R-41209', 'R-41620']);
  assert.deepEqual(evidence.draftGroups.find((g) => g.problem === 'cross-zone-day').reports, ['R-41344']);
  assert.deepEqual(evidence.draftGroups.find((g) => g.problem === 'invite-before-booking').reports, ['R-41236']);
  assert.equal(evidence.groups.find((g) => g.cause === 'parser').reportCount, 379);
  assert(evidence.draftGroups.filter((g) => g.investigation).every((g) => !['parser', 'hint'].includes(g.problem)));
  const filenames = {
    parser: '01-parser.md', hint: '02-booking-v3-hint.md',
    'one-day-shift': '03-one-day-shifts.md', 'cross-zone-day': '04-cross-zone-days.md',
    'invite-before-booking': '05-invite-before-booking.md',
  };
  for (const [problem, filename] of Object.entries(filenames)) {
    const text = await readFile(new URL(`./drafts/issues/${filename}`, import.meta.url), 'utf8');
    assert.equal(Number(text.match(/\*\*(\d+) unique reports?/)?.[1]), expected[problem], filename);
  }
});

test('cause-based deduplication rejects misleading subject matches', () => {
  assert.deepEqual(DEDUPE_CASES.map((c) => causes.sameCause(c.a, tenantOf(c.a), c.b, tenantOf(c.b))), [true, false, false, true, false]);
  assert.equal(evidence.subjectBuckets.length, 12);
  assert.equal(evidence.subjectBuckets.filter((g) => Object.keys(g.causes).length > 1).length, 10);
});

test('issue evidence quotes are copied exactly from source report bodies', async () => {
  for (const name of (await readdir(new URL('./drafts/issues/', import.meta.url))).filter((name) => name.endsWith('.md'))) {
    const text = await readFile(new URL(`./drafts/issues/${name}`, import.meta.url), 'utf8');
    const quotes = [...text.matchAll(/^> (.+)$/gm)].map((match) => match[1]);
    assert(quotes.length >= 1, `${name}: missing evidence quote`);
    assert(quotes.every((quote) => unique.some((r) => r.body === quote)));
  }
});

test('evidence hashes match this snapshot and receipt/merge peaks stay separate', async () => {
  for (const [path, expected] of Object.entries(evidence.sourceHashes)) {
    const actual = createHash('sha256').update(await readFile(new URL(path, root))).digest('hex');
    assert.equal(actual, expected, `Stale evidence: ${path}`);
  }
  assert.deepEqual(evidence.weekly['2026-06-29'], { received: 15, merged: 189 });
  assert.equal(Object.values(evidence.weekly).reduce((sum, w) => sum + w.received, 0), 412);
  assert.equal(Object.values(evidence.weekly).reduce((sum, w) => sum + w.merged, 0), 412);
});
