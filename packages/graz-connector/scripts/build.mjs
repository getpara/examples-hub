import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { glob } from 'glob';

const entryPoints = await glob('src/**/*.{ts,tsx,js,jsx}');

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

// Create directories for CJS and ESM builds
await fs.mkdir(`${distDir}/cjs`, { recursive: true });
await fs.writeFile(`${distDir}/cjs/package.json`, JSON.stringify({ type: 'commonjs' }, null, 2));

await fs.mkdir(`${distDir}/esm`, { recursive: true });
await fs.writeFile(`${distDir}/esm/package.json`, JSON.stringify({ type: 'module', sideEffects: false }, null, 2));

// ESM build
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
  outdir: `${distDir}/esm`,
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  target: ['es2015'],
  packages: 'external',
});

// CJS build
await esbuild.build({
  banner: {
    js: '"use client";', // Required for Next 13 App Router
  },
  bundle: false,
  write: true,
  format: 'cjs',
  loader: {
    '.png': 'dataurl',
    '.svg': 'dataurl',
    '.json': 'text',
  },
  platform: 'node',
  entryPoints,
  outdir: `${distDir}/cjs`,
  allowOverwrite: true,
  minify: false,
  target: ['es2015'],
  packages: 'external',
});
