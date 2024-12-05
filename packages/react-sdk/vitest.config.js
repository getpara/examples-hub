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
      exclude: ['node_modules', 'dist', '**/__tests__/**'],
      thresholds: {
        lines: 56.94,
        functions: 29.94,
        branches: 62.78,
        statements: 56.94,
      },
      reportOnFailure: true,
    },
  },
});
