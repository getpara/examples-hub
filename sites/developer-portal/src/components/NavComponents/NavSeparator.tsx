import { cn, Typography } from '@getpara/react-component-library';

type NavSeparatorProps = {
  className?: string;
};

export const NavSeparator = ({ className }: NavSeparatorProps) => (
  <Typography className={cn('para:text-border para:text-2xl para:font-medium', className)}>/</Typography>
);
