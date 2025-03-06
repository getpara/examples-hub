import { compress } from 'esbuild-plugin-compress';
import * as esbuild from 'esbuild';
// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);
// const pkg = require('../package.json');

// const externals = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

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
  plugins: [
    compress({
      exclude: ['**/*.map'],
    }),
  ],
  splitting: true, // Required for tree shaking
  minify: false,
  // external: externals,
  packages: 'external',
});
