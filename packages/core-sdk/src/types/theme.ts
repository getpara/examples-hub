export type Theme = {
  foregroundColor: string;
  backgroundColor: string;
  borderRadius?: BorderRadius;
};

export type BorderRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
