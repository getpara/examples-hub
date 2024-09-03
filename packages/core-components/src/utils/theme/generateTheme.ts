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
  accentColor,
  darkForegroundColor,
  darkBackgroundColor,
  darkAccentColor,
  mode = 'light',
  font,
  customPalette,
  borderRadius,
  customFontSizes,
  customBorderRadii,
}: Theme) => {
  const isDarkTheme = mode === 'dark';

  generatePalette({
    foregroundColor: isDarkTheme ? (darkForegroundColor ?? foregroundColor) : foregroundColor,
    backgroundColor: isDarkTheme ? (darkBackgroundColor ?? backgroundColor) : backgroundColor,
    accentColor: isDarkTheme ? (darkAccentColor ?? accentColor) : accentColor,
    customPalette,
    isDarkTheme,
  });

  generateFont({ font, customFontSizes });

  generateBorderRadii({ borderRadius, customBorderRadii });
};
