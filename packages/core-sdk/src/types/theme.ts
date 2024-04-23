export type Theme = {
  foregroundColor: string;
  backgroundColor: string;
  borderRadius?: BorderRadius;
};

type BorderRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'full';
