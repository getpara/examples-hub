import * as esbuild from 'esbuild';
import { compress } from 'esbuild-plugin-compress';

await esbuild.build({
  banner: {
    js: '"use client";', // Required for Next 13 App Router
  },
  bundle: true,
  write: false,
  format: 'esm',
  loader: {
    '.png': 'dataurl',
    '.svg': 'dataurl',
    '.json': 'text',
  },
  platform: 'browser',
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  plugins: [
    compress({
      exclude: ['**/*.map'],
    }),
  ],
  packages: 'external',
});
