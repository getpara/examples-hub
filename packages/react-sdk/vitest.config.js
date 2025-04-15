import { mergeConfig } from 'vite';
import baseConfig from '../../vitest.config.js';

export default mergeConfig(baseConfig, {
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['node_modules', 'dist', '**/__mocks__/**', '**/__tests__/**'],
      thresholds: {
        lines: 49.16,
        functions: 41.19,
        branches: 65.8,
        statements: 49.16,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
  },
});
