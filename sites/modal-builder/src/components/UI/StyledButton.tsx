import React from 'react';
import styled, { css } from 'styled-components';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'small' | 'medium';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  size?: Size;
  variant?: Variant;
}

const COLORS = {
  textDisabled: 'rgb(134, 134, 134)',

  // Primary
  iconPrimary: 'rgb(246, 246, 246)',
  backgroundPrimary: 'rgb(20, 20, 20)',
  backgroundPrimaryHover: 'rgb(60, 60, 60)',
  backgroundPrimaryActive: 'rgb(60, 60, 60)',
  backgroundPrimaryDisabled: 'rgb(214, 214, 214)',
  borderPrimary: 'rgb(20, 20, 20)',
  borderPrimaryHover: 'rgb(60, 60, 60)',
  borderPrimaryActive: 'rgb(60, 60, 60)',
  borderPrimaryDisabled: 'rgb(214, 214, 214)',

  // Secondary
  iconSecondary: 'rgb(20, 20, 20)',
  backgroundSecondary: 'rgb(255, 255, 255)',
  backgroundSecondaryHover: 'rgb(214, 214, 214)',
  backgroundSecondaryActive: 'rgb(214, 214, 214)',
  backgroundSecondaryDisabled: 'rgb(214, 214, 214)',
  borderSecondary: 'rgb(173, 173, 173)',
  borderSecondaryHover: 'rgb(173, 173, 173)',
  borderSecondaryActive: 'rgb(173, 173, 173)',
  borderSecondaryDisabled: 'rgb(214, 214, 214)',

  // Ghost
  iconGhost: 'rgb(133, 133, 133)',
  backgroundGhost: 'transparent',
  backgroundGhostHover: 'transparent',
  backgroundGhostDisabled: 'transparent',
  borderGhost: 'transparent',
};

const BORDER_RADIUS = {
  primary: '0.75rem',
  secondary: '0.75rem',
  ghost: '0px',
};

const FONT_SIZE = {
  small: '14px',
  medium: '1rem',
};

const PADDING = {
  small: {
    top: '0.75rem',
    bottom: '0.75rem',
    start: '1rem',
    end: '1rem',
  },
  medium: {
    top: '1rem',
    bottom: '1rem',
    start: '18px',
    end: '18px',
  },
};

const StyledButton = styled.button<{ $variant: Variant; $size: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${props =>
    props.$size === 'small'
      ? `${PADDING.small.top} ${PADDING.small.end} ${PADDING.small.bottom} ${PADDING.small.start}`
      : `${PADDING.medium.top} ${PADDING.medium.end} ${PADDING.medium.bottom} ${PADDING.medium.start}`};
  font-size: ${props => (props.$size === 'small' ? FONT_SIZE.small : FONT_SIZE.medium)};
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  text-decoration: none;
  border-width: ${props => (props.$variant === 'ghost' ? '0px' : '1px')};
  border-style: solid;
  border-radius: ${props => BORDER_RADIUS[props.$variant]};
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  ${props => {
    const variant = props.$variant;
    switch (variant) {
      case 'primary':
        return css`
          color: ${COLORS.iconPrimary};
          background-color: ${COLORS.backgroundPrimary};
          border-color: ${COLORS.borderPrimary};

          &:hover {
            color: ${COLORS.iconPrimary};
            background-color: ${COLORS.backgroundPrimaryHover};
            border-color: ${COLORS.borderPrimaryHover};
          }

          &:active {
            color: ${COLORS.iconPrimary};
            background-color: ${COLORS.backgroundPrimaryActive};
            border-color: ${COLORS.borderPrimaryActive};
          }

          &:disabled {
            color: ${COLORS.textDisabled};
            background-color: ${COLORS.backgroundPrimaryDisabled};
            border-color: ${COLORS.borderPrimaryDisabled};
            cursor: not-allowed;
            pointer-events: none;
          }
        `;
      case 'secondary':
        return css`
          color: ${COLORS.iconSecondary};
          background-color: ${COLORS.backgroundSecondary};
          border-color: ${COLORS.borderSecondary};

          &:hover {
            color: ${COLORS.iconSecondary};
            background-color: ${COLORS.backgroundSecondaryHover};
            border-color: ${COLORS.borderSecondaryHover};
          }

          &:active {
            color: ${COLORS.iconSecondary};
            background-color: ${COLORS.backgroundSecondaryActive};
            border-color: ${COLORS.borderSecondaryActive};
          }

          &:disabled {
            color: ${COLORS.textDisabled};
            background-color: ${COLORS.backgroundSecondaryDisabled};
            border-color: ${COLORS.borderSecondaryDisabled};
            cursor: not-allowed;
            pointer-events: none;
          }
        `;
      case 'ghost':
        return css`
          color: ${COLORS.iconGhost};
          background-color: ${COLORS.backgroundGhost};
          border-color: ${COLORS.borderGhost};

          &:hover {
            color: rgb(20, 20, 20);
          }

          &:active {
            color: rgb(20, 20, 20);
          }

          &:disabled {
            color: ${COLORS.textDisabled};
            cursor: not-allowed;
            pointer-events: none;
          }
        `;
      default:
        return '';
    }
  }}
`;

export const Button: React.FC<ButtonProps> = ({
  disabled = false,
  size = 'medium',
  variant = 'primary',
  children,
  ...rest
}) => {
  return (
    <StyledButton $size={size} $variant={variant} disabled={disabled} {...rest}>
      {children}
    </StyledButton>
  );
};
