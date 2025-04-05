import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      thresholds: {
        lines: 79,
        functions: 81,
        branches: 80.25,
        statements: 79,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
    testTimeout: 45000,
  },
});
