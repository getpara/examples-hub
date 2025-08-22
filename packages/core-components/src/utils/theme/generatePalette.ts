import { mix, readableColorIsBlack } from 'color2k';
import { Theme } from '../../interface.js';
import { getCssColors, isColor, overlayMix } from './utils.js';
import { COLOR_MIXES, DEFAULT_THEME, UTILITY_COLORS } from '../../constants.js';

export type Palette = {
  foregroundColors: string[];
  backgroundColors: string[];
  accentColors: string[];
};

export const generatePalette = ({
  foregroundColor,
  backgroundColor,
  accentColor,
  isDarkTheme,
  customPalette,
  overlayBackground,
}: Pick<Theme, 'foregroundColor' | 'backgroundColor' | 'accentColor' | 'customPalette' | 'overlayBackground'> & { isDarkTheme: boolean }) => {
  if (!foregroundColor || !isColor(foregroundColor)) {
    foregroundColor = DEFAULT_THEME.foregroundColor;
  }
  if (!backgroundColor || !isColor(backgroundColor)) {
    backgroundColor = DEFAULT_THEME.backgroundColor;
  }
  if (!Boolean(accentColor) || !isColor(accentColor)) {
    accentColor = foregroundColor;
  }

  const isDarkAccent = Boolean(accentColor) ? !readableColorIsBlack(accentColor) : false;

  const palette: Palette = {
    foregroundColors: [],
    backgroundColors: [],
    accentColors: [],
  };

  const backgroundMixColor = isDarkTheme ? '#FFFFFF' : '#000000';
  const foregroundMixColor = isDarkTheme ? '#000000' : '#FFFFFF';
  const accentMixColor = isDarkAccent ? '#FFFFFF' : '#000000';

  COLOR_MIXES.forEach(value => {
    palette.foregroundColors.push(mix(foregroundColor, foregroundMixColor, value));
    palette.backgroundColors.push(mix(backgroundColor, backgroundMixColor, value));
    palette.accentColors.push(mix(accentColor, accentMixColor, value));
  });

  // BACKGROUND
  document.documentElement.style.setProperty('--cpsl-color-background-0', palette.backgroundColors[0]);
  document.documentElement.style.setProperty('--cpsl-color-background-4', palette.backgroundColors[1]);
  document.documentElement.style.setProperty('--cpsl-color-background-8', palette.backgroundColors[2]);
  document.documentElement.style.setProperty('--cpsl-color-background-16', palette.backgroundColors[3]);
  document.documentElement.style.setProperty('--cpsl-color-background-32', palette.backgroundColors[4]);
  document.documentElement.style.setProperty('--cpsl-color-background-48', palette.backgroundColors[5]);
  document.documentElement.style.setProperty('--cpsl-color-background-64', palette.backgroundColors[6]);
  document.documentElement.style.setProperty('--cpsl-color-background-80', palette.backgroundColors[7]);
  document.documentElement.style.setProperty('--cpsl-color-background-96', palette.backgroundColors[8]);

  // FOREGROUND
  document.documentElement.style.setProperty('--cpsl-color-foreground-0', palette.foregroundColors[0]);
  document.documentElement.style.setProperty('--cpsl-color-foreground-4', palette.foregroundColors[1]);
  document.documentElement.style.setProperty('--cpsl-color-foreground-8', palette.foregroundColors[2]);
  document.documentElement.style.setProperty('--cpsl-color-foreground-16', palette.foregroundColors[3]);
  document.documentElement.style.setProperty('--cpsl-color-foreground-32', palette.foregroundColors[4]);
  document.documentElement.style.setProperty('--cpsl-color-foreground-48', palette.foregroundColors[5]);
  document.documentElement.style.setProperty('--cpsl-color-foreground-64', palette.foregroundColors[6]);
  document.documentElement.style.setProperty('--cpsl-color-foreground-80', palette.foregroundColors[7]);
  document.documentElement.style.setProperty('--cpsl-color-foreground-96', palette.foregroundColors[8]);

  // ACCENT
  document.documentElement.style.setProperty('--cpsl-color-accent-0', palette.accentColors[0]);
  document.documentElement.style.setProperty('--cpsl-color-accent-4', palette.accentColors[1]);
  document.documentElement.style.setProperty('--cpsl-color-accent-8', palette.accentColors[2]);
  document.documentElement.style.setProperty('--cpsl-color-accent-16', palette.accentColors[3]);
  document.documentElement.style.setProperty('--cpsl-color-accent-32', palette.accentColors[4]);
  document.documentElement.style.setProperty('--cpsl-color-accent-48', palette.accentColors[5]);
  document.documentElement.style.setProperty('--cpsl-color-accent-64', palette.accentColors[6]);
  document.documentElement.style.setProperty('--cpsl-color-accent-80', palette.accentColors[7]);
  document.documentElement.style.setProperty('--cpsl-color-accent-96', palette.accentColors[8]);

  // CONTRAST
  document.documentElement.style.setProperty('--cpsl-color-contrast', isDarkTheme ? '#FFFFFF' : '#000000');

  const utilityLightMixColor = '#FFFFFF';
  const utilityLightMixValue = 0.72;
  // UTILITY
  const red = overlayMix(foregroundColor, UTILITY_COLORS.red);
  const yellow = overlayMix(foregroundColor, UTILITY_COLORS.yellow);
  const green = overlayMix(foregroundColor, UTILITY_COLORS.green);
  document.documentElement.style.setProperty('--cpsl-color-utility-red', red);
  document.documentElement.style.setProperty('--cpsl-color-utility-yellow', yellow);
  document.documentElement.style.setProperty('--cpsl-color-utility-green', green);
  document.documentElement.style.setProperty('--cpsl-color-utility-red-light', mix(red, utilityLightMixColor, utilityLightMixValue));
  document.documentElement.style.setProperty('--cpsl-color-utility-yellow-light', mix(yellow, utilityLightMixColor, utilityLightMixValue));
  document.documentElement.style.setProperty('--cpsl-color-utility-green-light', mix(green, utilityLightMixColor, utilityLightMixValue));

  // OVERLAY BACKGROUND
  document.documentElement.style.setProperty('--cpsl-overlay-background', overlayBackground ?? 'linear-gradient(180deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.7) 100%)');

  if (customPalette) {
    const cssColorVars = getCssColors(customPalette);
    Object.entries(cssColorVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }
};
