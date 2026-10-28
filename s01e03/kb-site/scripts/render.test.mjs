import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const pagePath = 'kb/incidents/4471-review/index.html';
const html = await readFile(new URL('../rendered/' + pagePath, root), 'utf8');
const source = await readFile(new URL('src/routes/kb/incidents/4471-review/+page.svx', root), 'utf8');
/** @type {{ draftGroups: Array<{ problem: string; reportCount: number }> }} */
const analysis = JSON.parse(await readFile(new URL('../analysis.json', root), 'utf8'));
const deskCode = stripTypeScriptTypes(await readFile(new URL('src/lib/kb/desk-ref.ts', root), 'utf8'), { mode: 'strip' });
const { deskRef } = await import('data:text/javascript;base64,' + Buffer.from(deskCode).toString('base64'));

test('signed source is compiled into a real rendered page', () => {
  const signature = source.match(/^signature: '(.+)'$/m)?.[1];
  assert(signature);
  assert(source.trim().endsWith('<RenderStamp {signature} />'));
  assert(html.includes(deskRef(signature)));
  assert(!html.includes('no desk ref'));
  assert(html.includes('<h1'));
  assert(html.includes('split the problems, not just the subjects'));
});

test('rendered problem counts match the independent evidence ledger', () => {
  const rows = [...html.matchAll(/data-problem="([^"]+)" data-count="(\d+)"/g)]
    .map((match) => [match[1], Number(match[2])]);
  assert.deepEqual(Object.fromEntries(rows), Object.fromEntries(analysis.draftGroups.map((g) => [g.problem, g.reportCount])));
  assert.equal(rows.reduce((sum, row) => sum + Number(row[1]), 0), 412);
  assert(html.includes('379'));
  assert(html.includes('33'));
  assert(html.includes('427'));
  assert(html.includes('15'));
});

test('all five local issue drafts and original KB routes are linked', async () => {
  for (const name of ['01-parser.md', '02-booking-v3-hint.md', '03-one-day-shifts.md', '04-cross-zone-days.md', '05-invite-before-booking.md']) {
    assert(html.includes('/drafts/' + name));
    assert.equal(await readFile(new URL('../rendered/drafts/' + name, root), 'utf8'), await readFile(new URL('../drafts/issues/' + name, root), 'utf8'));
  }
  for (const route of ['kb/', 'kb/incidents/4471/', 'kb/triage/dedupe/', 'kb/decisions/0001-dedupe-by-subject/']) {
    assert((await readFile(new URL('../rendered/' + route + 'index.html', root), 'utf8')).includes('<html'));
  }
});

test('engineering closure preserves fixed versus retired outcomes', () => {
  assert(html.includes('2026-10-05'));
  assert(html.includes('parser: fixed.'));
  assert(html.includes('hint: won&#39;t fix.') || html.includes("hint: won't fix."));
  assert(html.includes('booking-v3 form retired'));
  assert(html.includes('The separate investigations remain unresolved'));
});

test('render artifact matches its recorded source and output hashes', async () => {
  const manifest = JSON.parse(await readFile(new URL('../rendered/render-manifest.json', root), 'utf8'));
  assert.equal(manifest.sourceSha256, createHash('sha256').update(source).digest('hex'));
  assert.equal(manifest.htmlSha256, createHash('sha256').update(html).digest('hex'));
  assert.equal(await readFile(new URL('../rendered/4471-review.svx', root), 'utf8'), source);
});
