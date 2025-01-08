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
        lines: 98.26,
        functions: 98.88,
        branches: 98.63,
        statements: 98.26,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
  },
});
