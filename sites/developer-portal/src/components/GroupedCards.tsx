import { Children, PropsWithChildren } from 'react';
import { FlatCard } from './FlatCard';
import { cn } from '@getpara/react-component-library';

export const GroupedCards = ({ children }: PropsWithChildren) => {
  const count = Children.count(children);

  return (
    <div
      className={cn('para:flex para:flex-col para:[&>*:not(:first-child)]:border-t-0', {
        'para:[&>*:first-child]:rounded-b-none para:[&>*:last-child]:rounded-t-none': count > 1,
        'para:[&>*:not(:first-child):not(:last-child)]:rounded-none': count > 2,
      })}
    >
      {children}
    </div>
  );
};

type GroupedCardProps = {
  className?: string;
} & PropsWithChildren;

export const GroupedCard = ({ className, children }: GroupedCardProps) => {
  return (
    <FlatCard className={cn('para:p-4 para:lg:p-4 para:flex-row para:justify-between', className)}>{children}</FlatCard>
  );
};
