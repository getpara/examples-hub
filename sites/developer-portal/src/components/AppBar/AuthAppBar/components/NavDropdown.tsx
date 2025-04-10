import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Typography,
} from '@getpara/react-component-library';
import { OrganizationAvatar } from '../../../OgranizationAvatar';
import { ChevronsUpDown } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';
import { Link } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { Environment } from '../../../../types/environment';
import { EnvIcon } from '../../../common';

type Option = {
  id: string;
  name: string;
  badge?: string;
  iconUrl?: string;
  env?: Environment;
};

type NavDropdownProps = {
  selected: Option;
  options: Option[];
  pathPrefix: string;
  pathSuffix?: string;
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
};

export const NavDropdown = ({
  selected,
  options,
  pathPrefix,
  pathSuffix,
  children,
  isOpen,
  setIsOpen,
}: NavDropdownProps & PropsWithChildren) => {
  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger className="para:rounded-sm">
        <Button
          asChild
          variant="ghost"
          className={clsx(
            'para:border para:border-transparent para:hover:border-border para:hover:bg-transparent para:rounded-sm para:p-1',
            {
              'para:border-border': isOpen,
            },
          )}
        >
          <div className="para:flex para:gap-4 para:items-center">
            <div className="para:flex para:gap-2 para:items-center">
              {selected.env ? (
                <div className="para:size-6 para:flex para:items-center para:justify-center">
                  <EnvIcon $environment={selected.env} />
                </div>
              ) : (
                <OrganizationAvatar
                  className="para:size-6 para:rounded-sm para:bg-background"
                  name={selected.name}
                  url={selected.iconUrl}
                />
              )}
              <Typography className="para:text-sm para:font-semibold">{selected.name}</Typography>
              {selected.badge && (
                <Badge
                  variant="outline"
                  className="para:border-border para:bg-muted para:rounded-xs para:text-2xs para:font-medium para:uppercase"
                >
                  {selected.badge}
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="para:size-4 para:stroke-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      {/* TODO: this zindex can change once the side nav changes */}
      <DropdownMenuContent className="para:z-[100000] para:rounded-sm" align="start">
        {options.map((o, i) => (
          <Fragment key={o.id}>
            <Link to={`${pathPrefix}${o.id}${pathSuffix ?? ''}`}>
              <DropdownMenuItem asChild className="para:hover:cursor-pointer">
                <div className="para:flex para:gap-2 para:items-center">
                  {o.env ? (
                    <div className="para:size-6 para:flex para:items-center para:justify-center">
                      <EnvIcon $environment={o.env} />
                    </div>
                  ) : (
                    <OrganizationAvatar
                      className="para:size-6 para:rounded-sm para:bg-background"
                      name={o.name}
                      url={o.iconUrl}
                    />
                  )}
                  <Typography className="para:text-sm para:font-semibold">{o.name}</Typography>
                  {o.badge && (
                    <Badge
                      variant="outline"
                      className="para:border-border para:bg-muted para:rounded-xs para:text-2xs para:font-medium"
                    >
                      {o.badge}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            </Link>
            {i !== options.length - 1 && <DropdownMenuSeparator />}
          </Fragment>
        ))}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
