import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    bail: true,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      thresholds: {
        lines: 83.63,
        functions: 88.5,
        branches: 80.96,
        statements: 83.63,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
    testTimeout: 45000,
  },
});
