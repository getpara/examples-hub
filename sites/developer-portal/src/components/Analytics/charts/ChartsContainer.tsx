import { PropsWithChildren } from 'react';

export const ChartsContainer = ({ children }: PropsWithChildren) => {
  return <div className="para:flex para:gap-2 para:flex-col para:xl:flex-row">{children}</div>;
};
