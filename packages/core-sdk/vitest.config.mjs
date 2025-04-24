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
        lines: 71.8,
        functions: 75.07,
        branches: 77.27,
        statements: 71.8,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
    testTimeout: 45000,
  },
});
