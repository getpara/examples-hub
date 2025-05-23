import { PropsWithChildren } from 'react';
import { Header } from './Header';
import { cn } from '@getpara/react-component-library';

type ContentWrapperProps = { className?: string } & PropsWithChildren;

export const ContentWrapper = ({ children, className }: ContentWrapperProps) => {
  return (
    <div className={cn('para:flex para:flex-col para:gap-4 para:flex-1', className)}>
      <Header />
      {children}
    </div>
  );
};
