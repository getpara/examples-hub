import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@getpara/react-component-library';
import clsx from 'clsx';
import {
  ArrowUpDown,
  BarChart,
  // LockKeyhole,
  LucideIcon,
  PaintbrushVertical,
  Palette,
  Settings,
  Shield,
  SquareArrowOutUpRight,
  Users,
} from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { MODAL_DESIGNER_LINK } from '../../../utils/constants';
import { OrganizationDropdown } from '../../../components/NavComponents/OrganizationDropdown';
import { useEffect } from 'react';

type TSidebarGroup = {
  title: string;
  items: SidebarItem[];
};

type SidebarItem = {
  text: string;
  Icon: LucideIcon;
  path: string;
  external?: boolean;
};

const PROJECT_ITEMS: SidebarItem[] = [
  {
    text: 'Setup',
    path: '/setup',
    Icon: Settings,
  },
  {
    text: 'Users',
    path: '/users',
    Icon: Users,
  },
  {
    text: 'Analytics',
    path: '/analytics',
    Icon: BarChart,
  },
];

const CONFIG_ITEMS: SidebarItem[] = [
  {
    text: 'Branding',
    path: '/branding',
    Icon: Palette,
  },
  {
    text: 'Security',
    path: '/security',
    Icon: Shield,
  },
  {
    text: 'On & Off Ramps',
    path: '/on-off-ramps',
    Icon: ArrowUpDown,
  },
  // TODO: add this back once we allow for permission configs on the api key
  // {
  //   text: 'Permissions',
  //   path: '/permissions',
  //   Icon: LockKeyhole,
  // },
  {
    text: 'Modal Designer',
    path: MODAL_DESIGNER_LINK,
    Icon: PaintbrushVertical,
    external: true,
  },
];

const GROUPS: TSidebarGroup[] = [
  { title: 'Project', items: PROJECT_ITEMS },
  { title: 'Configuration', items: CONFIG_ITEMS },
];

export const AppSidebar = () => {
  const { organizationId, projectId, apiKey, env } = useParams();
  const { pathname } = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, pathname, setOpenMobile]);

  if (!projectId || !apiKey || !env) {
    return null;
  }

  const pathPrefix = `/${organizationId}/project/${projectId}/key/${env}/${apiKey}`;

  return (
    <Sidebar
      className={clsx(
        'para:mt-[var(--appbar-height-mobile)] para:lg:mt-[var(--appbar-height)]',
        'para:h-[calc(100svh-var(--appbar-height-mobile))] para:lg:h-[calc(100svh-var(--appbar-height))]',
      )}
      noMobileOverlay
      mobileSheetContentClassName="para:border-border para:shadow-none para:h-[calc(100svh-var(--appbar-height-mobile))] para:lg:h-[calc(100svh-var(--appbar-height))] para:mt-[var(--appbar-height-mobile)] para:lg:mt-[var(--appbar-height)]"
    >
      <SidebarHeader className="para:block para:md:hidden">
        <OrganizationDropdown />
      </SidebarHeader>
      <SidebarContent>
        {GROUPS.map(group => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => (
                  <SidebarMenuItem key={item.text}>
                    <Link
                      to={item.external ? item.path : `${pathPrefix}${item.path}`}
                      target={item.external ? '_blank' : '_self'}
                    >
                      <SidebarMenuButton isActive={pathname === `${pathPrefix}${item.path}`}>
                        <item.Icon />
                        {item.text}
                        {item.external && <SquareArrowOutUpRight className="para:ml-auto" />}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
