import { mergeConfig } from 'vite';
import baseConfig from '../../vitest.config.js';

export default mergeConfig(baseConfig, {
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['src/index.ts', 'src/types.ts'],
      thresholds: {
        lines: 85,
        functions: 100,
        branches: 70,
        statements: 85,
      },
      reportOnFailure: true,
    },
    setupFiles: './__tests__/setup.ts',
  },
});
