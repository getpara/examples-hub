import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    hmr: true,
    watch: {
      ignored: ['!../packages/*/dist/**'],
    },
    fs: {
      allow: [path.resolve(__dirname, '../../packages'), path.resolve(__dirname, './src')],
    },
  },
});
