import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const output = new URL('../rendered/', root);
await mkdir(output, { recursive: true });
await cp(new URL('build/', root), output, { recursive: true });
const source = await readFile(new URL('src/routes/kb/incidents/4471-review/+page.svx', root));
const html = await readFile(new URL('kb/incidents/4471-review/index.html', output));
await writeFile(new URL('4471-review.svx', output), source);
await writeFile(new URL('render-manifest.json', output), JSON.stringify({
  builtAt: new Date().toISOString(),
  source: '4471-review.svx',
  page: 'kb/incidents/4471-review/index.html',
  sourceSha256: createHash('sha256').update(source).digest('hex'),
  htmlSha256: createHash('sha256').update(html).digest('hex'),
}, null, 2) + '\n');
console.log('Rendered site and signed .svx copied to s01e03/private/rendered/.');
