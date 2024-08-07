import { DEFAULT_THEME } from '../../constants';
import { Theme } from '../../interface';
import { generateBorderRadii } from './generateBorderRadii';
import { generateFont } from './generateFont';
import { generatePalette } from './generatePalette';

/**
 * Generates css theme variables.
 * @returns @boolean Whether background is dark or not.
 */
export const generateTheme = ({
  foregroundColor = DEFAULT_THEME.foregroundColor,
  backgroundColor = DEFAULT_THEME.backgroundColor,
  font,
  customPalette,
  borderRadius,
  customFontSizes,
  customBorderRadii,
}: Theme): boolean => {
  const palette = generatePalette({ foregroundColor, backgroundColor, customPalette });

  generateFont({ font, customFontSizes });

  generateBorderRadii({ borderRadius, customBorderRadii });

  return palette.isDarkBackground;
};
