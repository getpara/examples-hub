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
        statements: 20.14,
        branches: 39.99,
        functions: 3.32,
        lines: 20.14,
      },
      reportOnFailure: true,
    },
  },
});
