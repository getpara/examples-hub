import { ThemeMode } from '@getpara/react-sdk';

// Utility to get luminance from a hex color
function getLuminance(hex: string): number {
  // Remove hash if present
  hex = hex.replace(/^#/, '');
  // Parse r, g, b
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply sRGB companding
  [r, g, b] = [r, g, b].map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Returns 'LIGHT' or 'DARK' based on luminance
export function getThemeModeFromColor(hex: string): ThemeMode {
  if (!hex) return ThemeMode.LIGHT;
  return getLuminance(hex) > 0.5 ? ThemeMode.LIGHT : ThemeMode.DARK;
}
