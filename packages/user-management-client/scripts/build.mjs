import { compress } from 'esbuild-plugin-compress';
import * as esbuild from 'esbuild';

/** @type {import('esbuild').BuildOptions} */

await esbuild.build({
  bundle: true,
  write: false,
  format: 'esm',
  loader: {
    '.json': 'text',
  },
  platform: 'node',
  entryPoints: ['src/index.ts'],
  outdir: 'dist/esm',
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
});

await esbuild.build({
  bundle: true,
  write: false,
  format: 'cjs',
  loader: {
    '.json': 'text',
  },
  platform: 'node',
  entryPoints: ['src/index.ts'],
  outdir: 'dist/cjs',
  allowOverwrite: true,
  minify: false,
  target: ['es2015'],
  plugins: [
    compress({
      exclude: ['**/*.map'],
    }),
  ],
  packages: 'external',
});
