import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildScriptPath = path.join(rootDir, 'scripts/build.mjs');

test('build script creates deployable dist layout and minified bundle', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'money-converter-build-'));
  const nonMinOutDir = path.join(workspace, 'non-min');
  const minOutDir = path.join(workspace, 'min');

  await run(process.execPath, [buildScriptPath, '--out-dir', nonMinOutDir], { cwd: rootDir });
  await run(process.execPath, [buildScriptPath, '--minify', '--out-dir', minOutDir], { cwd: rootDir });

  const minHtmlPath = path.join(minOutDir, 'convert.html');
  const minCssPath = path.join(minOutDir, 'src/styles/main.css');
  const minFontPath = path.join(minOutDir, 'src/fonts/Manrope-400.woff2');
  const minBundlePath = path.join(minOutDir, 'src/js/app.bundle.js');
  const nonMinBundlePath = path.join(nonMinOutDir, 'src/js/app.bundle.js');

  const [minHtml, minCss, minBundle, nonMinBundle, minBundleStat, nonMinBundleStat, fontStat] = await Promise.all([
    readFile(minHtmlPath, 'utf8'),
    readFile(minCssPath, 'utf8'),
    readFile(minBundlePath, 'utf8'),
    readFile(nonMinBundlePath, 'utf8'),
    stat(minBundlePath),
    stat(nonMinBundlePath),
    stat(minFontPath)
  ]);

  assert.match(minHtml, /<script\s+defer\s+src="src\/js\/app\.bundle\.js"><\/script>/);
  assert.match(minCss, /Manrope-400\.woff2/);
  assert.equal(fontStat.isFile(), true);

  assert.ok(minBundleStat.size <= nonMinBundleStat.size);
  assert.doesNotMatch(minBundle, /^\/\/\s+src\/js\//m);
  assert.ok(minBundle.split('\n').length <= nonMinBundle.split('\n').length);
});
