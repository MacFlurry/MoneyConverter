import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const htmlPath = new URL('../convert.html', import.meta.url);

test('convert.html loads a classic deferred script for local file compatibility', async () => {
  const html = await readFile(htmlPath, 'utf8');

  assert.match(html, /<script\s+defer\s+src="src\/js\/app\.bundle\.js"><\/script>/);
  assert.doesNotMatch(html, /type="module"/);
});
