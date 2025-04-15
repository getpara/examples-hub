import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { glob } from 'glob';
// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);
// const pkg = require('../package.json');

// const externals = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

const entryPoints = await glob('src/**/*.{ts,tsx,js,jsx}');

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

await fs.mkdir(distDir, { recursive: true });
await fs.writeFile(`${distDir}/package.json`, JSON.stringify({ type: 'module', sideEffects: ['wasm_exec.js'] }, null, 2));

await fs.mkdir(`${distDir}/workers`, { recursive: true });

/** @type {import('esbuild').BuildOptions} */
await esbuild.build({
  banner: {
    js: '"use client";', // Required for Next 13 App Router
  },
  bundle: false,
  write: true,
  format: 'esm',
  loader: {
    '.json': 'text',
  },
  platform: 'browser',
  entryPoints,
  outdir: distDir,
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  target: ['es2015'],
  define: {
    global: 'globalThis',
  },
  // external: externals,
  packages: 'external',
});

await esbuild.build({
  banner: {
    js: '"use client";', // Required for Next 13 App Router
  },
  bundle: false,
  write: true,
  format: 'esm',
  loader: {
    '.json': 'text',
  },
  platform: 'browser',
  entryPoints: ['src/workers/worker.ts'],
  outdir: `${distDir}/workers`,
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  target: ['es2015'],
  packages: 'external',
  define: {
    global: 'globalThis',
  },
});
