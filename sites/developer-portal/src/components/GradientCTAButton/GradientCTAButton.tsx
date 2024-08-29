import { HTMLAttributes, PropsWithChildren } from 'react';
import { GradientButton } from '../common';
import { CpslIcon } from '@usecapsule/react-components';
import { Components } from '@usecapsule/core-components';

export const GradientCTAButton = ({
  children,
  ...rest
}: PropsWithChildren & HTMLAttributes<HTMLCpslButtonElement> & Components.CpslButton) => {
  return (
    <GradientButton {...rest} variant="primary">
      <CpslIcon slot="start" icon="stars" />
      {children}
    </GradientButton>
  );
};
