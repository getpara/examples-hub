import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['**/wasm_exec.js'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
  },
});
