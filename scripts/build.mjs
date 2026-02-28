import { readFile, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const moduleOrder = [
  'src/js/config.js',
  'src/js/formatters.js',
  'src/js/converter.js',
  'src/js/rates-service.js',
  'src/js/ui.js',
  'src/js/main.js'
];

function transformModule(source) {
  return source
    .replace(/import[\s\S]*?;\n/g, '')
    .replace(/\bexport\s+(?=(const|function|async function|class))/g, '');
}

async function build() {
  const transformedChunks = [];

  for (const relativeFile of moduleOrder) {
    const absoluteFile = path.join(rootDir, relativeFile);
    const source = await readFile(absoluteFile, 'utf8');
    transformedChunks.push(`// ${relativeFile}\n${transformModule(source).trim()}\n`);
  }

  const output = `(() => {\n${transformedChunks.join('\n')}\n})();\n`;
  const outputFile = path.join(rootDir, 'src/js/app.bundle.js');

  await writeFile(outputFile, output, 'utf8');
  console.log(`Built ${path.relative(rootDir, outputFile)}`);
}

function runBuild() {
  return build().catch((error) => {
    console.error('Build failed:', error);
    process.exitCode = 1;
  });
}

const isWatchMode = process.argv.includes('--watch');

if (!isWatchMode) {
  await runBuild();
} else {
  await runBuild();
  const srcDir = path.join(rootDir, 'src/js');
  let timer;

  console.log(`Watching ${path.relative(rootDir, srcDir)} for changes...`);

  watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.js')) return;

    clearTimeout(timer);
    timer = setTimeout(async () => {
      console.log(`Detected ${eventType} in ${filename}`);
      await runBuild();
    }, 80);
  });
}
