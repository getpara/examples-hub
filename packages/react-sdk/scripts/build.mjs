import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { glob } from 'glob';

const entryPoints = await glob('src/**/*.{ts,tsx,js,jsx}');

// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);
// const pkg = require('../package.json');

// const externals = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

const pkgRaw = await fs.readFile(resolve(__dirname, '../package.json'), 'utf-8');
const pkg = JSON.parse(pkgRaw);

await fs.mkdir(distDir, { recursive: true });
await fs.writeFile(`${distDir}/package.json`, JSON.stringify({ type: 'module', sideEffects: ['*.css'] }, null, 2));

/** @type {import('esbuild').BuildOptions} */
await esbuild.build({
  banner: {
    js: '"use client";', // Required for Next 13 App Router
  },
  bundle: false,
  write: true,
  format: 'esm',
  loader: {
    '.png': 'dataurl',
    '.svg': 'dataurl',
    '.json': 'text',
  },
  platform: 'browser',
  entryPoints,
  outdir: distDir,
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  target: ['es2015'],
  // external: externals,
  packages: 'external',
  define: {
    'process.env.PARA_REACT_SDK_VERSION': JSON.stringify(pkg.version),
  },
});
