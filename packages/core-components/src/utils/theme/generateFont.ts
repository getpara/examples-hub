import { Theme } from '../../interface.js';

const FONT_NAME_MAP = {
  body2XS: 'body-2xs',
  bodyXS: 'body-xs',
  bodyS: 'body-s',
  bodyM: 'body-m',
  bodyL: 'body-l',
  bodyXL: 'body-xl',
  headingXS: 'heading-xs',
  headingS: 'heading-s',
  headingM: 'heading-m',
  headingL: 'heading-l',
  headingXL: 'heading-xl',
  heading2XL: 'heading-2xl',
};

export const generateFont = ({ font, customFontSizes }: Pick<Theme, 'font' | 'customFontSizes'>) => {
  if (font) {
    document.documentElement.style.setProperty('--cpsl-default-font', font);
  }

  Object.entries(FONT_NAME_MAP).forEach(([key, value]) => {
    if (customFontSizes?.[key]) {
      document.documentElement.style.setProperty(`--cpsl-font-size-${value}`, customFontSizes[key]);
    } else {
      document.documentElement.style.removeProperty(`--cpsl-font-size-${value}`);
    }
  });
};
