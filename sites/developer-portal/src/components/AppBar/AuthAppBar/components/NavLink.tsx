import { Typography } from '@getpara/react-component-library';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type NavLinkProps = {
  to: string;
  Icon: LucideIcon;
  text: string;
};

export const NavLink = ({ to, Icon, text }: NavLinkProps) => {
  return (
    <Link
      to={to}
      target="_blank"
      className="para:flex para:items-center para:gap-1 para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:focus-visible:ring-[3px] para:outline-none"
    >
      <Icon className="para:size-4 para:stroke-secondary-foreground" />
      <Typography color="secondary" className="para:text-sm para:font-medium">
        {text}
      </Typography>
    </Link>
  );
};
