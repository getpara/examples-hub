import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@getpara/react-component-library';
import { useAccount } from '@getpara/react-sdk';
import clsx from 'clsx';
import { Building2, CreditCard, LogOut, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useLogout } from '../../../../hooks/useLogout';

export const AccountDropdown = () => {
  const { data: account } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useLogout();

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger className="para:rounded-full">
        <Avatar
          asChild
          className={clsx('para:bg-primary para:border para:border-transparent', {
            'para:border-muted-foreground': isOpen,
          })}
        >
          <AvatarFallback className="para:bg-primary para:text-lg para:font-medium para:text-white">
            {account?.email?.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="para:z-[100000] para:rounded-sm" align="end">
        <DropdownMenuLabel>{account?.email}</DropdownMenuLabel>
        <DropdownMenuItem className="para:hover:cursor-pointer">
          <User className="para:stroke-popover-foreground" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem className="para:hover:cursor-pointer">
          <Building2 className="para:stroke-popover-foreground" />
          Organization
        </DropdownMenuItem>
        <DropdownMenuItem className="para:hover:cursor-pointer">
          <CreditCard className="para:stroke-popover-foreground" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem className="para:hover:cursor-pointer">
          <Users className="para:stroke-popover-foreground" />
          Team
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" className="para:hover:cursor-pointer" onClick={logout}>
          <LogOut className="para:stroke-destructive" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
