import { defineCustomElements } from '../dist/loader/index.js';
import { generateTheme } from '../src/utils/theme/generateTheme';
import '../css/capsule-core.css';

defineCustomElements();

generateTheme({});

/** @type { import('@storybook/html').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
