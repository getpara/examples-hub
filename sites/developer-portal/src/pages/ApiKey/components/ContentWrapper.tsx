import { PropsWithChildren } from 'react';
import { Header } from './Header';
import clsx from 'clsx';

type ContentWrapperProps = { className?: string } & PropsWithChildren;

export const ContentWrapper = ({ children, className }: ContentWrapperProps) => {
  return (
    <div className={clsx('para:flex para:flex-col para:gap-4 para:flex-1', className)}>
      <Header />
      {children}
    </div>
  );
};
