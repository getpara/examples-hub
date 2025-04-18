import { PropsWithChildren } from 'react';

export const ContentWrapper = ({ children }: PropsWithChildren) => {
  return <div className="para:flex para:flex-col para:gap-4 para:flex-1">{children}</div>;
};
