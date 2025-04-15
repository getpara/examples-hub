import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { glob } from 'glob';

const entryPoints = await glob('src/**/*.{ts,tsx,js,jsx}');

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

await fs.mkdir(`${distDir}/cjs`, { recursive: true });
await fs.writeFile(`${distDir}/cjs/package.json`, JSON.stringify({ type: 'commonjs' }, null, 2));

await fs.mkdir(`${distDir}/esm`, { recursive: true });
await fs.writeFile(`${distDir}/esm/package.json`, JSON.stringify({ type: 'module', sideEffects: false }, null, 2));

/** @type {import('esbuild').BuildOptions} */
await esbuild.build({
  bundle: false,
  write: true,
  format: 'esm',
  loader: {
    '.json': 'text',
  },
  platform: 'browser',
  entryPoints,
  outdir: 'dist/esm',
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  target: ['es2015'],
  packages: 'external',
});

await esbuild.build({
  bundle: false,
  write: true,
  format: 'cjs',
  loader: {
    '.json': 'text',
  },
  platform: 'node',
  entryPoints,
  outdir: 'dist/cjs',
  allowOverwrite: true,
  minify: false,
  target: ['es2015'],
  packages: 'external',
});
