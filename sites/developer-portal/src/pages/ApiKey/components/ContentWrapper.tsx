import { PropsWithChildren } from 'react';
import { Header } from './Header';

export const ContentWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="para:flex para:flex-col para:gap-4 para:flex-1">
      <Header />
      {children}
    </div>
  );
};
