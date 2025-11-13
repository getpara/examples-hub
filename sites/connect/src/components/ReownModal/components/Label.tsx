import { Label as BaseLabel } from '@getpara/react-component-library';
import { PropsWithChildren } from 'react';

export const Label = ({ children }: PropsWithChildren) => {
  return <BaseLabel className="para:text-xs para:text-muted-foreground">{children}</BaseLabel>;
};
