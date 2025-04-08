import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      thresholds: {
        lines: 80.23,
        functions: 75.07,
        branches: 77.27,
        statements: 80.23,
      },
      reportOnFailure: true,
    },
    bail: 1,
    setupFiles: './__tests__/setup.ts',
    testTimeout: 45000,
  },
});
