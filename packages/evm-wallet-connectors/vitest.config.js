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
        lines: 41,
        functions: 43,
        branches: 61,
        statements: 41,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
  },
});
