import {
  Avatar,
  AvatarFallback,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@getpara/react-component-library';
import { useAccount } from '@getpara/react-sdk';
import { Building2, CreditCard, LogOut, LucideIcon, Users } from 'lucide-react';
import { useState } from 'react';
import { useLogout } from '../../../../hooks/useLogout';
import { useOrganizationMemberCapabilities } from '../../../../hooks/api/queries/useOrganizationMember';
import { Link, useParams } from 'react-router-dom';

const MENU_ITEMS: {
  label: string;
  value: string;
  Icon: LucideIcon;
  capabilityKey?: string;
}[] = [
  // {
  //   label: 'Account',
  //   value: 'account',
  //   Icon: User,
  // },
  {
    label: 'Organization',
    value: 'dashboard/settings',
    Icon: Building2,
    capabilityKey: 'canUpdateOrganization',
  },
  {
    label: 'Billing',
    value: 'billing',
    Icon: CreditCard,
    capabilityKey: 'canViewOrganizationBilling',
  },
  {
    label: 'Team',
    value: 'team',
    Icon: Users,
    capabilityKey: 'canViewMembers',
  },
];

export const AccountDropdown = () => {
  const { organizationId } = useParams();
  const { data: account } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useLogout();
  const { data: capabilities } = useOrganizationMemberCapabilities();

  const basePath = `/${organizationId}/`;

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger className="para:rounded-full">
        <Avatar
          asChild
          className={cn('para:bg-primary para:border para:border-transparent', {
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
        {MENU_ITEMS.map(item =>
          (item.capabilityKey && capabilities?.[item.capabilityKey]) || !item.capabilityKey ? (
            <Link key={item.value} to={`${basePath}${item.value}`}>
              <DropdownMenuItem className="para:hover:cursor-pointer">
                <item.Icon className="para:stroke-popover-foreground" />
                {item.label}
              </DropdownMenuItem>
            </Link>
          ) : null,
        )}
        <DropdownMenuItem variant="destructive" className="para:hover:cursor-pointer" onClick={logout}>
          <LogOut className="para:stroke-destructive" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
