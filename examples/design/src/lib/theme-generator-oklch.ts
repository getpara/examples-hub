import chroma from 'chroma-js';

export function generateOklchPalette(hexColor: string) {
  // Convert hex to OKLCH
  const base = chroma(hexColor).oklch();
  const [l, c, h] = base; // [lightness, chroma, hue]

  // Generate 11-step palette
  return {
    50: chroma.oklch(Math.min(l + 0.4, 0.99), c * 0.3, h).css(),
    100: chroma.oklch(Math.min(l + 0.3, 0.95), c * 0.5, h).css(),
    200: chroma.oklch(Math.min(l + 0.2, 0.9), c * 0.7, h).css(),
    300: chroma.oklch(Math.min(l + 0.1, 0.85), c * 0.85, h).css(),
    400: chroma.oklch(l, c * 0.95, h).css(),
    500: chroma.oklch(l, c, h).css(), // Base color
    600: chroma.oklch(l * 0.9, c * 1.1, h).css(),
    700: chroma.oklch(l * 0.8, c * 1.15, h).css(),
    800: chroma.oklch(l * 0.7, c * 1.2, h).css(),
    900: chroma.oklch(l * 0.6, c * 1.1, h).css(),
    950: chroma.oklch(l * 0.5, c, h).css(),
  };
}

export function generateThemeFromColor(hexColor: string) {
  const palette = generateOklchPalette(hexColor);

  return {
    'primary': palette[700],
    'primary-foreground': palette[50],
    'secondary': palette[100],
    'secondary-foreground': palette[900],
    'accent': palette[100],
    'accent-foreground': palette[900],
    'border': palette[200],
    'input': palette[200],
    'ring': palette[500],
    'muted': palette[100],
    'muted-foreground': palette[600],
  };
}

export function generateAccessiblePalette(hexColor: string) {
  const base = chroma(hexColor).oklch();
  const [l, c, h] = base;

  // Generate scale with perceptually uniform lightness
  const lightnesses = [0.98, 0.95, 0.9, 0.82, 0.7, 0.55, 0.45, 0.35, 0.25, 0.18, 0.12];

  return lightnesses.map((targetL, index) => ({
    step: (index + 1) * 50,
    color: chroma.oklch(targetL, c * (1 - Math.abs(targetL - l) * 0.3), h).css(),
  }));
}

export function applyTheme(theme: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
