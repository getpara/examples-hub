import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';

function TablePagination({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-label="pagination"
      data-slot="pagination"
      className={cn('para:mx-auto para:flex para:w-full para:justify-center', className)}
      {...props}
    />
  );
}

function TablePaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('para:flex para:flex-row para:items-center para:gap-1', className)}
      {...props}
    />
  );
}

function TablePaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type TablePaginationButtonProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof Button>;

function TablePaginationButton({ className, isActive, ...props }: TablePaginationButtonProps) {
  return (
    <Button
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={className}
      variant={isActive ? 'outline' : 'ghost'}
      {...props}
    />
  );
}

type TablePaginationPrevNextProps = {
  hideLabel?: boolean;
} & React.ComponentProps<typeof TablePaginationButton>;

function TablePaginationPrevious({ className, hideLabel, ...props }: TablePaginationPrevNextProps) {
  return (
    <TablePaginationButton
      aria-label="Go to previous page"
      size="default"
      className={cn('para:gap-1 para:px-2.5 para:sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className={cn('para:sm:block', { 'para:hidden': hideLabel })}>Previous</span>
    </TablePaginationButton>
  );
}

function TablePaginationNext({ className, hideLabel, ...props }: TablePaginationPrevNextProps) {
  return (
    <TablePaginationButton
      aria-label="Go to next page"
      size="default"
      className={cn('para:gap-1 para:px-2.5 para:sm:pr-2.5', className)}
      {...props}
    >
      <span className={cn('para:sm:block', { 'para:hidden': hideLabel })}>Next</span>
      <ChevronRightIcon />
    </TablePaginationButton>
  );
}

function TablePaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('para:flex para:size-9 para:items-center para:justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className={'para:size-4'} />
      <span className={'para:sr-only'}>More pages</span>
    </span>
  );
}

export {
  TablePagination,
  TablePaginationContent,
  TablePaginationButton,
  TablePaginationItem,
  TablePaginationPrevious,
  TablePaginationNext,
  TablePaginationEllipsis,
};
