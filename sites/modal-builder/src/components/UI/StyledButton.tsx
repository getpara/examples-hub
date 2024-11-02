import React from 'react';
import styled, { css } from 'styled-components';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
type Size = 'small' | 'medium';
type AsType = 'button' | 'a';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: AsType;
  disabled?: boolean;
  fullWidth?: boolean;
  href?: string;
  size?: Size;
  target?: string;
  variant?: Variant;
}

const COLORS = {
  // Text Colors
  textPrimary: 'rgb(20, 20, 20)', // --cpsl-color-text-primary: var(--cpsl-color-foreground-0)
  textSecondary: 'rgb(133, 133, 133)', // --cpsl-color-text-secondary: var(--cpsl-color-background-48)
  textTertiary: 'rgb(97, 97, 97)', // --cpsl-color-text-tertiary: var(--cpsl-color-foreground-32)
  textSubtle: 'rgb(92, 92, 92)', // --cpsl-color-text-subtle: var(--cpsl-color-background-64)
  textInverted: 'rgb(246, 246, 246)', // --cpsl-color-text-inverted
  textDisabled: 'rgb(134, 134, 134)', // --cpsl-color-text-disabled
  textError: 'rgb(240, 68, 56)', // --cpsl-color-text-error
  textContrast: 'rgb(0, 0, 0)', // --cpsl-color-text-contrast

  // Background Colors
  backgroundPrimary: 'rgb(20, 20, 20)', // --cpsl-color-primary-button-surface-default
  backgroundPrimaryHover: 'rgb(60, 60, 60)', // --cpsl-color-primary-button-surface-hover
  backgroundPrimaryActive: 'rgb(60, 60, 60)', // --cpsl-color-primary-button-surface-pressed
  backgroundPrimaryDisabled: 'rgb(214, 214, 214)', // --cpsl-color-primary-button-surface-disabled

  backgroundSecondary: 'rgb(255, 255, 255)', // --cpsl-color-secondary-button-surface-default
  backgroundSecondaryHover: 'rgb(214, 214, 214)', // --cpsl-color-secondary-button-surface-hover
  backgroundSecondaryActive: 'rgb(214, 214, 214)', // --cpsl-color-secondary-button-surface-pressed
  backgroundSecondaryDisabled: 'rgb(214, 214, 214)', // --cpsl-color-secondary-button-surface-disabled

  backgroundTertiary: 'rgb(235, 235, 235)', // --cpsl-color-tertiary-button-surface-default
  backgroundTertiaryHover: 'rgb(214, 214, 214)', // --cpsl-color-tertiary-button-surface-hover
  backgroundTertiaryActive: 'rgb(214, 214, 214)', // --cpsl-color-tertiary-button-surface-pressed
  backgroundTertiaryDisabled: 'rgb(235, 235, 235)', // --cpsl-color-tertiary-button-surface-disabled

  backgroundGhost: 'transparent', // --cpsl-color-ghost-button-surface-default
  backgroundGhostHover: 'transparent', // --cpsl-color-ghost-button-hover
  backgroundGhostDisabled: 'transparent', // --cpsl-color-ghost-button-disabled

  backgroundDestructive: 'transparent', // --cpsl-color-destructive-button-surface-default
  backgroundDestructiveHover: 'rgb(251, 203, 199)', // --cpsl-color-destructive-button-surface-hover
  backgroundDestructiveActive: 'rgb(251, 203, 199)', // --cpsl-color-destructive-button-surface-pressed
  backgroundDestructiveDisabled: 'rgb(246, 246, 246)', // --cpsl-color-destructive-button-surface-disabled

  // Border Colors
  borderPrimary: 'rgb(20, 20, 20)', // --cpsl-color-primary-button-border-default
  borderPrimaryHover: 'rgb(60, 60, 60)', // --cpsl-color-primary-button-surface-hover
  borderPrimaryActive: 'rgb(60, 60, 60)', // --cpsl-color-primary-button-surface-pressed
  borderPrimaryDisabled: 'rgb(214, 214, 214)', // --cpsl-color-primary-button-border-disabled

  borderSecondary: 'rgb(173, 173, 173)', // --cpsl-color-secondary-button-border-default
  borderSecondaryHover: 'rgb(173, 173, 173)', // --cpsl-color-secondary-button-surface-hover
  borderSecondaryActive: 'rgb(173, 173, 173)', // --cpsl-color-secondary-button-surface-pressed
  borderSecondaryDisabled: 'rgb(214, 214, 214)', // --cpsl-color-secondary-button-border-disabled

  borderTertiary: 'rgb(173, 173, 173)', // --cpsl-color-tertiary-button-border-default
  borderTertiaryHover: 'rgb(214, 214, 214)', // --cpsl-color-tertiary-button-surface-hover
  borderTertiaryActive: 'rgb(214, 214, 214)', // --cpsl-color-tertiary-button-surface-pressed
  borderTertiaryDisabled: 'rgb(173, 173, 173)', // --cpsl-color-tertiary-button-border-disabled

  borderGhost: 'transparent', // --cpsl-color-ghost-button-border-default

  borderDestructive: 'rgb(240, 68, 56)', // --cpsl-color-destructive-button-border-default
  borderDestructiveHover: 'rgb(240, 68, 56)', // --cpsl-color-destructive-button-border-default
  borderDestructiveActive: 'rgb(240, 68, 56)', // --cpsl-color-destructive-button-border-default
  borderDestructiveDisabled: 'rgb(246, 246, 246)', // --cpsl-color-destructive-button-border-disabled

  iconPrimary: 'rgb(246, 246, 246)', // --cpsl-color-primary-button-text
  iconSecondary: 'rgb(20, 20, 20)', // --cpsl-color-secondary-button-text
  iconTertiary: 'rgb(235, 235, 235)', // --cpsl-color-tertiary-button-text
  iconGhost: 'rgb(133, 133, 133)', // --cpsl-color-ghost-button-default
  iconDestructive: 'rgb(240, 68, 56)', // --cpsl-color-destructive-button-text
  iconDisabled: 'rgb(134, 134, 134)', // --cpsl-color-text-disabled
};

const BORDER_RADIUS = {
  primary: '0.75rem', // --cpsl-border-radius-primary-button
  secondary: '0.75rem', // --cpsl-border-radius-secondary-button
  tertiary: '0.75rem', // --cpsl-border-radius-tertiary-button
  ghost: '0px', // No border radius for ghost variant
  destructive: '0.75rem', // --cpsl-border-radius-secondary-button
};

const FONT_SIZE = {
  small: '14px', // --cpsl-font-size-body-s
  medium: '1rem', // --cpsl-font-size-body-m
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

const StyledButton = styled.button<{ $variant: Variant; $size: Size; $fullWidth: boolean }>`
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
  font-family: inherit;
  white-space: nowrap;
  text-decoration: none;
  border-width: ${props => (props.$variant === 'ghost' ? '0px' : '1px')};
  border-style: solid;
  border-radius: ${props => BORDER_RADIUS[props.$variant || 'primary']};
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  height: fit-content;
  font-family: 'Inter', sans-serif;

  ${props => {
    const variant = props.$variant || 'primary';
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
      case 'tertiary':
        return css`
          color: ${COLORS.iconTertiary};
          background-color: ${COLORS.backgroundTertiary};
          border-color: ${COLORS.borderTertiary};

          &:hover {
            color: ${COLORS.iconTertiary};
            background-color: ${COLORS.backgroundTertiaryHover};
            border-color: ${COLORS.borderTertiaryHover};
          }

          &:active {
            color: ${COLORS.iconTertiary};
            background-color: ${COLORS.backgroundTertiaryActive};
            border-color: ${COLORS.borderTertiaryActive};
          }

          &:disabled {
            color: ${COLORS.textDisabled};
            background-color: ${COLORS.backgroundTertiaryDisabled};
            border-color: ${COLORS.borderTertiaryDisabled};
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
            color: ${COLORS.textPrimary};
          }

          &:active {
            color: ${COLORS.textPrimary};
          }

          &:disabled {
            color: ${COLORS.textDisabled};
            cursor: not-allowed;
            pointer-events: none;
          }
        `;
      case 'destructive':
        return css`
          color: ${COLORS.iconDestructive};
          background-color: ${COLORS.backgroundDestructive};
          border-color: ${COLORS.borderDestructive};

          &:hover {
            color: ${COLORS.iconDestructive};
            background-color: ${COLORS.backgroundDestructiveHover};
            border-color: ${COLORS.borderDestructiveHover};
          }

          &:active {
            color: ${COLORS.iconDestructive};
            background-color: ${COLORS.backgroundDestructiveActive};
            border-color: ${COLORS.borderDestructiveActive};
          }

          &:disabled {
            color: ${COLORS.textDisabled};
            background-color: ${COLORS.backgroundDestructiveDisabled};
            border-color: ${COLORS.borderDestructiveDisabled};
            cursor: not-allowed;
            pointer-events: none;
          }
        `;
      default:
        return '';
    }
  }}

  /* Disabled State */
  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;
      pointer-events: none;
    `}
`;

export const Button: React.FC<ButtonProps> = ({
  as = 'button',
  disabled = false,
  fullWidth = false,
  href,
  size = 'medium',
  target,
  variant = 'primary',
  children,
  ...rest
}) => {
  const ComponentTag: React.ElementType = as;

  return (
    <StyledButton
      as={ComponentTag}
      href={as === 'a' ? href : undefined}
      target={as === 'a' ? target : undefined}
      disabled={as !== 'a' ? disabled : undefined}
      $fullWidth={fullWidth}
      $size={size}
      $variant={variant}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};
