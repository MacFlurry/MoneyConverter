import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const htmlPath = new URL('../convert.html', import.meta.url);

test('convert.html loads a classic deferred script for local file compatibility', async () => {
  const html = await readFile(htmlPath, 'utf8');

  assert.match(html, /<script\s+defer\s+src="src\/js\/app\.bundle\.js"><\/script>/);
  assert.doesNotMatch(html, /type="module"/);
});

test('convert.html defines a restrictive CSP policy', async () => {
  const html = await readFile(htmlPath, 'utf8');

  assert.match(html, /http-equiv="Content-Security-Policy"/);
  assert.match(html, /default-src 'self'/);
  assert.match(html, /script-src 'self'/);
  assert.match(html, /style-src 'self'/);
  assert.match(html, /font-src 'self'/);
  assert.match(html, /connect-src 'self' https:\/\/open\.er-api\.com/);
  assert.match(html, /object-src 'none'/);
  assert.match(html, /base-uri 'none'/);
  assert.match(html, /frame-ancestors 'none'/);
  assert.match(html, /form-action 'none'/);
});
