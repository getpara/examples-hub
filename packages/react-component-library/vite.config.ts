import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { peerDependencies } from './package.json';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ rollupTypes: true }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/theme.css',
          dest: '',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: format => `index.${format}.js`,
    },

    rollupOptions: {
      external: [...Object.keys(peerDependencies), 'react/jsx-runtime'],
      output: { preserveModules: true, exports: 'named' },
    },
    target: 'esnext',
  },
});
