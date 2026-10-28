import { copyFile, mkdir, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const review = new URL('src/lib/data/report-review.json', root);
await copyFile(new URL('../report-review.json', root), review);
const drafts = new URL('static/drafts/', root);
await mkdir(drafts, { recursive: true });
for (const name of (await readdir(new URL('../drafts/issues/', root))).filter((name) => name.endsWith('.md'))) {
  await copyFile(new URL(`../drafts/issues/${name}`, root), new URL(name, drafts));
}
const evidence = new URL('static/evidence/', root);
await mkdir(evidence, { recursive: true });
for (const [source, name] of [
  ['src/lib/kb/causes.ts', 'causes.ts'],
  ['src/lib/data/desk-notes.json', 'desk-notes.json'],
  ['src/lib/data/report-review.json', 'report-review.json'],
  ['src/lib/data/engineering-update.json', 'engineering-update.json'],
]) {
  await copyFile(new URL(source, root), new URL(name, evidence));
}
console.log('Synced local review assignments and issue drafts.');
