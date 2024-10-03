import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

type Color = 'primary' | 'secondary' | 'tertiary' | 'subtle' | 'inverted' | 'error' | 'contrast';

type Variant =
  | 'body2XS'
  | 'bodyXS'
  | 'bodyS'
  | 'bodyM'
  | 'bodyL'
  | 'bodyXL'
  | 'headingXS'
  | 'headingS'
  | 'headingM'
  | 'headingL'
  | 'headingXL'
  | 'heading2XL';

type Weight = 'regular' | 'medium' | 'semiBold' | 'bold';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  color?: Color;
  variant?: Variant;
  weight?: Weight;
}

const colorMap: { [key in Color]: string } = {
  primary: 'rgba(20, 20, 20, 1)', // --cpsl-color-text-primary
  secondary: 'rgba(133, 133, 133, 1)', // --cpsl-color-text-secondary
  tertiary: 'rgba(97, 97, 97, 1)', // --cpsl-color-text-tertiary
  subtle: 'rgba(92, 92, 92, 1)', // --cpsl-color-text-subtle
  inverted: 'rgba(246, 246, 246, 1)', // --cpsl-color-text-inverted
  error: 'rgba(240, 68, 56, 1)', // --cpsl-color-text-error
  contrast: 'rgba(0, 0, 0, 1)', // --cpsl-color-text-contrast
};

const background64 = 'rgba(92, 92, 92, 1)'; // --cpsl-color-background-64
const selectionColor = colorMap['inverted'];

const variantConfig: {
  [key in Variant]: {
    element: keyof JSX.IntrinsicElements;
    fontSize: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
} = {
  body2XS: { element: 'p', fontSize: '10px' },
  bodyXS: { element: 'p', fontSize: '0.75rem' },
  bodyS: { element: 'p', fontSize: '14px', lineHeight: '142.857%' },
  bodyM: { element: 'p', fontSize: '1rem', lineHeight: '150%' },
  bodyL: { element: 'p', fontSize: '20px', lineHeight: '140%' },
  bodyXL: { element: 'p', fontSize: '1.5rem' },
  headingXS: { element: 'h6', fontSize: '1.5rem' },
  headingS: { element: 'h5', fontSize: '32px' },
  headingM: { element: 'h4', fontSize: '40px', letterSpacing: '-0.0.25rem' },
  headingL: { element: 'h3', fontSize: '56px', letterSpacing: '-1.0.75rem' },
  headingXL: { element: 'h2', fontSize: '64px', letterSpacing: '-1.28px' },
  heading2XL: { element: 'h1', fontSize: '72px', letterSpacing: '-1.44px' },
};

const fontWeightMap: { [key in Weight]: number } = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

const StyledText = styled.p<{
  $color: Color;
  $variant: Variant;
  $weight: Weight;
  $fontSize: string;
  $lineHeight?: string;
  $letterSpacing?: string;
}>`
  font-family: 'Inter', sans-serif;
  color: ${props => colorMap[props.$color]};
  padding: 0;
  margin: 0;
  display: block;
  font-size: ${props => props.$fontSize};
  font-weight: ${props => fontWeightMap[props.$weight]};
  ${props => props.$lineHeight && `line-height: ${props.$lineHeight};`}
  ${props => props.$letterSpacing && `letter-spacing: ${props.$letterSpacing};`}

  /* Font smoothing for better rendering */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;

  /* Selection styles */
  ::-moz-selection {
    color: ${selectionColor} !important;
    background: ${background64} !important;
  }
  ::selection {
    color: ${selectionColor} !important;
    background: ${background64} !important;
  }
`;

export const Text: React.FC<PropsWithChildren<TextProps>> = ({
  color = 'primary',
  variant = 'bodyM',
  weight = 'regular',
  children,
  ...rest
}) => {
  const config = variantConfig[variant];

  return (
    <StyledText
      as={config.element}
      $color={color}
      $variant={variant}
      $weight={weight}
      $fontSize={config.fontSize}
      $lineHeight={config.lineHeight}
      $letterSpacing={config.letterSpacing}
      {...rest}
    >
      {children}
    </StyledText>
  );
};
