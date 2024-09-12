import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      '@tanstack/react-query': path.resolve(__dirname, '../../node_modules/@tanstack/react-query'),
    },
  },
});
