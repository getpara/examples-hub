import { compress } from 'esbuild-plugin-compress';
import * as esbuild from 'esbuild';

await esbuild.build({
  bundle: true,
  write: false,
  format: 'esm',
  loader: {
    '.json': 'text',
  },
  platform: 'browser',
  entryPoints: ['src/index.ts'],
  outdir: 'dist/esm',
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: true,
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
  minify: true,
  plugins: [
    compress({
      exclude: ['**/*.map'],
    }),
  ],
  packages: 'external',
});
