import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['**/wasm_exec.js', '**/prime.worker.min.js'],
      thresholds: {
        lines: 98.23,
        functions: 98.88,
        branches: 98.62,
        statements: 98.23,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
  },
});
