import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('para:bg-primary/10 para:animate-pulse para:rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
