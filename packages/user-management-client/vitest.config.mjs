import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      reportOnFailure: true,
      thresholds: {
        lines: 96.6,
        functions: 97.08,
        branches: 92.1,
        statements: 96.6,
      },
    },
  },
});
