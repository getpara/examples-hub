import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      thresholds: {
        lines: 9.64,
        functions: 25,
        branches: 75,
        statements: 9.64,
      },
      reportOnFailure: true,
    },
  },
});
