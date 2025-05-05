import { PropsWithChildren } from 'react';

export const OverviewContainer = ({ children }: PropsWithChildren) => {
  return <div className="para:flex para:flex-wrap para:gap-2">{children}</div>;
};
