import { HTMLAttributes, PropsWithChildren } from 'react';
import { GradientButton } from '../common';
import { CpslIcon } from '@usecapsule/react-components';
import { Components } from '@usecapsule/core-components';

type GradientCTAButtonProps = {
  noIcon?: boolean;
} & PropsWithChildren &
  HTMLAttributes<HTMLCpslButtonElement> &
  Components.CpslButton;

export const GradientCTAButton = ({ children, noIcon, ...rest }: GradientCTAButtonProps) => {
  return (
    <GradientButton {...rest} variant="primary">
      {!noIcon && <CpslIcon slot="start" icon="stars" />}
      {children}
    </GradientButton>
  );
};
