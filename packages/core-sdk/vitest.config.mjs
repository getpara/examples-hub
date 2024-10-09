import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['html'],
    },
    setupFiles: './__tests__/setup.ts',
  },
});
