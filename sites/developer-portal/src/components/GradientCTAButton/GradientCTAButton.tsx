import { HTMLAttributes, PropsWithChildren } from 'react';
import { GradientButton } from '../common';
import { CpslIcon } from '@usecapsule/react-components';
import { Components, IconType } from '@usecapsule/core-components';
import styled from 'styled-components';

type GradientCTAButtonProps = {
  noIcon?: boolean;
  icon?: IconType;
  iconSize?: number;
  gap?: number;
} & PropsWithChildren &
  HTMLAttributes<HTMLCpslButtonElement> &
  Components.CpslButton;

export const GradientCTAButton = ({ children, noIcon, icon, iconSize = 24, gap = 8, ...rest }: GradientCTAButtonProps) => {
  return (
    <StyledGradientButton {...rest} $gap={gap} variant="primary">
      {!noIcon && <StyledIcon slot="start" icon={icon ?? 'stars'} $size={iconSize} />}
      {children}
    </StyledGradientButton>
  );
};

const StyledGradientButton = styled(GradientButton)<{ $gap: number }>`
  --button-gap: ${({ $gap }) => `${$gap}px`};
`;

const StyledIcon = styled(CpslIcon)<{ $size: number }>`
  --height: ${({ $size }) => `${$size}px`};
  --width: ${({ $size }) => `${$size}px`};
`;
