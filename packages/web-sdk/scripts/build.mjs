import * as esbuild from 'esbuild';
import { compress } from 'esbuild-plugin-compress';
// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);
// const pkg = require('../package.json');

// const externals = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

/** @type {import('esbuild').BuildOptions} */

await esbuild.build({
  banner: {
    js: '"use client";', // Required for Next 13 App Router
  },
  bundle: true,
  write: false,
  format: 'esm',
  loader: {
    '.json': 'text',
  },
  platform: 'browser',
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  target: ['es2015'],
  plugins: [
    compress({
      exclude: ['**/*.map'],
    }),
  ],
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
  bundle: true,
  write: false,
  format: 'esm',
  loader: {
    '.json': 'text',
  },
  platform: 'browser',
  entryPoints: ['src/workers/worker.ts'],
  outdir: 'dist/workers',
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  target: ['es2015'],
  packages: 'external',
  plugins: [
    compress({
      exclude: ['**/*.map'],
    }),
  ],
  define: {
    global: 'globalThis',
  },
});
