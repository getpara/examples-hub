import { compress } from 'esbuild-plugin-compress';
import * as esbuild from 'esbuild';
// import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);
// const pkg = require('../package.json');

// const skipDeps = ['@celo/utils', 'ethereumjs-util', '@noble/hashes'];

// const externals = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})].filter(
//   dep => !skipDeps.includes(dep),
// );

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
  plugins: [
    compress({
      exclude: ['**/*.map'],
    }),
    // nodeModulesPolyfillPlugin({
    //   globals: {
    //     process: true,
    //     Buffer: true,
    //   },
    //   modules: ['stream', 'process', 'buffer', 'crypto'],
    // }),
  ],
  define: { 'process.env.NODE_DEBUG': '""' },
  // external: externals,
  packages: 'external',
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
