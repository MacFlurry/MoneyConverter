import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

const staticEntries = [
  { type: 'file', path: 'convert.html' },
  { type: 'file', path: '_headers' },
  { type: 'dir', path: 'src/styles' },
  { type: 'dir', path: 'src/fonts' }
];

function transformModule(source) {
  return source
    .replace(/import[\s\S]*?;\n/g, '')
    .replace(/\bexport\s+(?=(const|function|async function|class))/g, '');
}

function parseArgs(argv) {
  const options = {
    watch: false,
    minify: false,
    outDir: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--watch') {
      options.watch = true;
      continue;
    }

    if (arg === '--minify') {
      options.minify = true;
      continue;
    }

    if (arg === '--out-dir') {
      const next = argv[index + 1];
      if (!next) {
        throw new Error('Missing value for --out-dir');
      }

      options.outDir = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.watch && options.outDir) {
    throw new Error('--watch cannot be used with --out-dir');
  }

  return options;
}

function minifyBundle(source) {
  const withoutBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, '');

  const lines = withoutBlockComments
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));

  return `${lines.join('\n')}\n`;
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyStaticAssets(outputRoot) {
  for (const entry of staticEntries) {
    const sourcePath = path.join(rootDir, entry.path);
    const destinationPath = path.join(outputRoot, entry.path);
    const sourceExists = await pathExists(sourcePath);

    if (!sourceExists) {
      continue;
    }

    if (entry.type === 'file') {
      await mkdir(path.dirname(destinationPath), { recursive: true });
      await cp(sourcePath, destinationPath);
      continue;
    }

    await cp(sourcePath, destinationPath, { recursive: true });
  }
}

async function build({ minify, outDir }) {
  const transformedChunks = [];

  for (const relativeFile of moduleOrder) {
    const absoluteFile = path.join(rootDir, relativeFile);
    const source = await readFile(absoluteFile, 'utf8');
    const moduleBody = transformModule(source).trim();

    if (minify) {
      transformedChunks.push(moduleBody);
    } else {
      transformedChunks.push(`// ${relativeFile}\n${moduleBody}\n`);
    }
  }

  const outputRoot = outDir ? path.resolve(rootDir, outDir) : rootDir;
  const isDistBuild = outputRoot !== rootDir;

  if (isDistBuild) {
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(outputRoot, { recursive: true });
  }

  const unminifiedOutput = `(() => {\n${transformedChunks.join('\n')}\n})();\n`;
  const output = minify ? minifyBundle(unminifiedOutput) : unminifiedOutput;
  const outputFile = path.join(outputRoot, 'src/js/app.bundle.js');

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, output, 'utf8');

  if (isDistBuild) {
    await copyStaticAssets(outputRoot);
  }

  console.log(`Built ${path.relative(rootDir, outputFile)}`);

  if (isDistBuild) {
    console.log(`Prepared deployment directory: ${path.relative(rootDir, outputRoot)}`);
  }
}

function runBuild(options) {
  return build(options).catch((error) => {
    console.error('Build failed:', error);
    process.exitCode = 1;
  });
}

const options = parseArgs(process.argv.slice(2));
const isWatchMode = options.watch;

if (!isWatchMode) {
  await runBuild(options);
} else {
  await runBuild(options);
  const srcDir = path.join(rootDir, 'src/js');
  let timer;

  console.log(`Watching ${path.relative(rootDir, srcDir)} for changes...`);

  watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.js')) return;

    clearTimeout(timer);
    timer = setTimeout(async () => {
      console.log(`Detected ${eventType} in ${filename}`);
      await runBuild(options);
    }, 80);
  });
}
