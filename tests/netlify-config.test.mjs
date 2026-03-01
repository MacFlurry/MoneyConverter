import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const netlifyConfigPath = new URL('../netlify.toml', import.meta.url);
const headersPath = new URL('../_headers', import.meta.url);

test('netlify.toml deploys the production artifact directory', async () => {
  const netlifyConfig = await readFile(netlifyConfigPath, 'utf8');

  assert.match(netlifyConfig, /\[build\]/);
  assert.match(netlifyConfig, /command\s*=\s*"npm run build:prod"/);
  assert.match(netlifyConfig, /publish\s*=\s*"dist"/);
});

test('_headers defines baseline security headers', async () => {
  const headers = await readFile(headersPath, 'utf8');

  assert.match(headers, /^\/\*\s*$/m);
  assert.match(headers, /X-Content-Type-Options:\s*nosniff/);
  assert.match(headers, /X-Frame-Options:\s*DENY/);
});
