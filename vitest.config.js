import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    global: true,
    setupFiles: '../../setupTests.ts',
  },
});
