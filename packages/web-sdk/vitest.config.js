import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      thresholds: {
        lines: 14.19,
        functions: 5.98,
        branches: 38.09,
        statements: 14.19,
      },
      reportOnFailure: true,
    },
  },
});
