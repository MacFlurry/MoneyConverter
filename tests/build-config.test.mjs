import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageJsonPath = new URL('../package.json', import.meta.url);
const buildScriptPath = new URL('../scripts/build.mjs', import.meta.url);

test('package.json defines a local build script for app.bundle.js', async () => {
  const raw = await readFile(packageJsonPath, 'utf8');
  const pkg = JSON.parse(raw);
  const buildScript = await readFile(buildScriptPath, 'utf8');

  assert.equal(typeof pkg.scripts?.build, 'string');
  assert.match(pkg.scripts.build, /^node scripts\/build\.mjs$/);
  assert.match(buildScript, /src\/js\/main\.js/);
  assert.match(buildScript, /src\/js\/app\.bundle\.js/);
});
