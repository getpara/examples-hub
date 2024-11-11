export type Theme = {
  foregroundColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  darkForegroundColor?: string;
  darkBackgroundColor?: string;
  darkAccentColor?: string;
  mode?: 'light' | 'dark';
  borderRadius?: BorderRadius;
  font?: string;
};

export type BorderRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
