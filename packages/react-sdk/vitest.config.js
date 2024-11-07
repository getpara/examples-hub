import { mergeConfig } from 'vite';
import baseConfig from '../../vitest.config.js';

export default mergeConfig(baseConfig, {
  test: {
    environment: 'jsdom',
  },
});
