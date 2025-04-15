import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      thresholds: {
        lines: 1.92,
        functions: 15,
        branches: 19.04,
        statements: 1.92,
      },
      reportOnFailure: true,
    },
  },
});
