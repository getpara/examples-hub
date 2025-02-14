import { compress } from 'esbuild-plugin-compress';
import * as esbuild from 'esbuild';

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
  entryPoints: ['lib/index.ts'],
  outdir: 'dist',
  allowOverwrite: true,
  plugins: [
    compress({
      exclude: ['**/*.map'],
    }),
  ],
  external: ['react', 'react-dom'],
  splitting: true, // Required for tree shaking
  minify: true,
  packages: 'external',
});
