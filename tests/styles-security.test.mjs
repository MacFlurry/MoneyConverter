import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cssPath = new URL('../src/styles/main.css', import.meta.url);

test('main.css does not load external font providers', async () => {
  const css = await readFile(cssPath, 'utf8');

  assert.doesNotMatch(css, /@import/i);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/i);
  assert.doesNotMatch(css, /fonts\.gstatic\.com/i);
  assert.match(css, /@font-face/);
  assert.match(css, /Manrope-400\.woff2/);
});
