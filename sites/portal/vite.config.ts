import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), nodePolyfills(), tailwindcss()],
  server: {
    hmr: true,
    watch: {
      ignored: ['!../packages/*/dist/**'],
    },
    fs: {
      allow: [path.resolve(__dirname, '../../packages'), path.resolve(__dirname, './src')],
    },
    headers: {
      '*.wasm.br': {
        'Content-Type': 'application/wasm',
        'Content-Encoding': 'br',
      },
      '*.wasm.gz': {
        'Content-Type': 'application/wasm',
        'Content-Encoding': 'gzip',
      },
    },
    // Configure middleware to set headers for compressed WASM files
    configure: server => {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.wasm.br')) {
          res.setHeader('Content-Type', 'application/wasm');
          res.setHeader('Content-Encoding', 'br');
        } else if (req.url?.endsWith('.wasm.gz')) {
          res.setHeader('Content-Type', 'application/wasm');
          res.setHeader('Content-Encoding', 'gzip');
        }
        next();
      });
    },
  },
});
