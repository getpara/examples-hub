import Color from 'color'; // npm install color

export function generateThemeFromColor(hexColor: string) {
  const baseColor = Color(hexColor);

  // Generate 11-step palette
  const palette = {
    50: baseColor.lighten(0.95).hex(),
    100: baseColor.lighten(0.85).hex(),
    200: baseColor.lighten(0.7).hex(),
    300: baseColor.lighten(0.5).hex(),
    400: baseColor.lighten(0.3).hex(),
    500: hexColor, // Base color
    600: baseColor.darken(0.15).hex(),
    700: baseColor.darken(0.3).hex(),
    800: baseColor.darken(0.45).hex(),
    900: baseColor.darken(0.6).hex(),
    950: baseColor.darken(0.75).hex(),
  };

  // Map to theme variables
  return {
    'color-primary': palette[700],
    'color-primary-foreground': palette[50],
    'color-secondary': palette[100],
    'color-secondary-foreground': palette[900],
    'color-accent': palette[100],
    'color-accent-foreground': palette[900],
    'color-border': palette[200],
    'color-input': palette[200],
    'color-ring': palette[500],
  };
}

export function applyTheme(theme: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
