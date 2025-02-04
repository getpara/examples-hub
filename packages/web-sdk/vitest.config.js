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
        lines: 97.6,
        functions: 97.8,
        branches: 98.2,
        statements: 97.61,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
  },
});
