export type Theme = {
  foregroundColor: string;
  backgroundColor: string;
  accentColor?: string;
  mode?: 'light' | 'dark';
  borderRadius?: BorderRadius;
};

export type BorderRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
