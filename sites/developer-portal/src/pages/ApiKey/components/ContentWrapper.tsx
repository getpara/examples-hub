import { ReactNode } from 'react';
import { Header } from './Header';
import { cn } from '@getpara/react-component-library';

type ContentWrapperProps = { className?: string; columnOne: ReactNode; columnTwo?: ReactNode };

export const ContentWrapper = ({ className, columnOne, columnTwo }: ContentWrapperProps) => {
  return (
    <div
      className={cn(
        'para:flex para:flex-col para:gap-4 para:flex-1 para:max-w-[808px]',
        {
          'para:xl:max-w-[calc(808px+calc(var(--para-spacing)*8)+var(--side-card-width))]': !!columnTwo,
        },
        className,
      )}
    >
      <Header />
      <div className="para:flex para:flex-col-reverse para:xl:flex-row para:gap-8">
        <div className="para:flex para:flex-col para:gap-4 para:flex-1">{columnOne}</div>
        {columnTwo}
      </div>
    </div>
  );
};
