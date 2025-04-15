import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { glob } from 'glob';

const entryPoints = await glob('src/**/*.{ts,tsx,js,jsx}');
// import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);
// const pkg = require('../package.json');

// const skipDeps = ['@celo/utils', '@ethereumjs/util', '@noble/hashes'];

// const externals = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})].filter(
//   dep => !skipDeps.includes(dep),
// );
const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

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
  outdir: `${distDir}/esm`,
  allowOverwrite: true,
  splitting: true, // Required for tree shaking
  minify: false,
  target: ['es2015'],
  plugins: [
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
  bundle: false,
  write: true,
  format: 'cjs',
  loader: {
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
