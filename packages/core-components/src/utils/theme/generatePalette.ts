import { mix, readableColorIsBlack } from 'color2k';
import { Theme } from '../../interface';
import { getCssColors, isColor, overlayMix } from './utils';
import { COLOR_MIXES, DEFAULT_THEME, UTILITY_COLORS } from '../../constants';

export type Palette = {
  foregroundColors: string[];
  backgroundColors: string[];
  isDarkBackground: boolean;
};

export const generatePalette = ({
  foregroundColor,
  backgroundColor,
  customPalette,
}: Pick<Theme, 'foregroundColor' | 'backgroundColor' | 'customPalette'>): Palette => {
  if (!foregroundColor || !isColor(foregroundColor)) {
    foregroundColor = DEFAULT_THEME.foregroundColor;
  }
  if (!backgroundColor || !isColor(backgroundColor)) {
    backgroundColor = DEFAULT_THEME.backgroundColor;
  }

  const isDarkBackground = !readableColorIsBlack(backgroundColor);

  const palette: Palette = {
    foregroundColors: [],
    backgroundColors: [],
    isDarkBackground,
  };

  const backgroundMixColor = isDarkBackground ? '#FFFFFF' : '#000000';
  const foregroundMixColor = isDarkBackground ? '#000000' : '#FFFFFF';

  COLOR_MIXES.forEach(value => {
    palette.foregroundColors.push(mix(foregroundColor, foregroundMixColor, value));
    palette.backgroundColors.push(mix(backgroundColor, backgroundMixColor, value));
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

  const utilityLightMixColor = '#FFFFFF';
  const utilityLightMixValue = 0.72;
  // UTILITY
  const red = overlayMix(foregroundColor, UTILITY_COLORS.red);
  const yellow = overlayMix(foregroundColor, UTILITY_COLORS.yellow);
  const green = overlayMix(foregroundColor, UTILITY_COLORS.green);
  document.documentElement.style.setProperty('--cpsl-color-utility-red', red);
  document.documentElement.style.setProperty('--cpsl-color-utility-yellow', yellow);
  document.documentElement.style.setProperty('--cpsl-color-utility-green', green);
  document.documentElement.style.setProperty(
    '--cpsl-color-utility-red-light',
    mix(red, utilityLightMixColor, utilityLightMixValue),
  );
  document.documentElement.style.setProperty(
    '--cpsl-color-utility-yellow-light',
    mix(yellow, utilityLightMixColor, utilityLightMixValue),
  );
  document.documentElement.style.setProperty(
    '--cpsl-color-utility-green-light',
    mix(green, utilityLightMixColor, utilityLightMixValue),
  );

  if (customPalette) {
    const cssColorVars = getCssColors(customPalette);
    Object.entries(cssColorVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }

  return palette;
};
