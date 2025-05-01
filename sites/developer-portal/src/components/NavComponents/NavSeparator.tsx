import { Typography } from '@getpara/react-component-library';
import clsx from 'clsx';

type NavSeparatorProps = {
  className?: string;
};

export const NavSeparator = ({ className }: NavSeparatorProps) => (
  <Typography className={clsx('para:text-border para:text-2xl para:font-medium', className)}>/</Typography>
);
