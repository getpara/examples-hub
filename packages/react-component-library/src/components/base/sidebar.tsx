'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import { PanelLeftIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet';
import { Button } from './button';
import { Input } from './input';
import { Separator } from './separator';
import { Skeleton } from './skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'para:group/sidebar-wrapper para:has-data-[variant=inset]:bg-sidebar para:flex para:min-h-svh para:w-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'para:bg-sidebar para:text-sidebar-foreground para:flex para:h-full para:w-(--sidebar-width) para:flex-col',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className={'para:bg-sidebar para:text-sidebar-foreground para:w-(--sidebar-width) para:p-0 para:[&>button]:hidden'}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className={'para:sr-only'}>
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className={'para:flex para:h-full para:w-full para:flex-col'}>{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={'para:group para:peer para:text-sidebar-foreground para:hidden para:md:block'}
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          'para:relative para:w-(--sidebar-width) para:bg-transparent para:transition-[width] para:duration-200 para:ease-linear',
          'para:group-data-[collapsible=offcanvas]:w-0',
          'para:group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'para:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'para:group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        className={cn(
          'para:fixed para:inset-y-0 para:z-10 para:hidden para:h-svh para:w-(--sidebar-width) para:transition-[left,right,width] para:duration-200 para:ease-linear para:md:flex',
          side === 'left'
            ? 'para:left-0 para:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'para:right-0 para:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          // Adjust the padding for floating and inset variants.
          variant === 'floating' || variant === 'inset'
            ? 'para:p-2 para:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'para:border-border para:group-data-[collapsible=icon]:w-(--sidebar-width-icon) para:group-data-[side=left]:border-r para:group-data-[side=right]:border-l',

          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className={
            'para:bg-sidebar para:group-data-[variant=floating]:border-border para:flex para:h-full para:w-full para:flex-col para:group-data-[variant=floating]:rounded-lg para:group-data-[variant=floating]:border para:group-data-[variant=floating]:shadow-sm'
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={(cn('para:h-7 para:w-7'), className)}
      onClick={event => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className={'para:sr-only'}>Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'para:hover:after:bg-sidebar-border para:absolute para:inset-y-0 para:z-20 para:hidden para:w-4 para:-translate-x-1/2 para:transition-all para:ease-linear para:group-data-[side=left]:-right-4 para:group-data-[side=right]:left-0 para:after:absolute para:after:inset-y-0 para:after:left-1/2 para:after:w-[2px] para:sm:flex',
        'para:in-data-[side=left]:cursor-w-resize para:in-data-[side=right]:cursor-e-resize',
        'para:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize para:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'para:hover:group-data-[collapsible=offcanvas]:bg-sidebar para:group-data-[collapsible=offcanvas]:translate-x-0 para:group-data-[collapsible=offcanvas]:after:left-full',
        'para:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        'para:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'para:bg-background para:relative para:flex para:w-full para:flex-1 para:flex-col',
        'para:md:peer-data-[variant=inset]:m-2 para:md:peer-data-[variant=inset]:ml-0 para:md:peer-data-[variant=inset]:rounded-xl para:md:peer-data-[variant=inset]:shadow-sm para:md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn('para:bg-background para:h-8 para:w-full para:shadow-none', className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('para:flex para:flex-col para:gap-2 para:p-2', className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('para:flex para:flex-col para:gap-2 para:p-2', className)}
      {...props}
    />
  );
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('para:bg-sidebar-border para:mx-2 para:w-auto', className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'para:flex para:min-h-0 para:flex-1 para:flex-col para:gap-2 para:overflow-auto para:group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('para:relative para:flex para:w-full para:min-w-0 para:flex-col para:p-2', className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({ className, asChild = false, ...props }: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'para:text-sidebar-foreground/70 para:ring-sidebar-ring para:flex para:h-8 para:shrink-0 para:items-center para:rounded-md para:px-2 para:text-xs para:font-medium para:outline-hidden para:transition-[margin,opacity] para:duration-200 para:ease-linear para:focus-visible:ring-2 para:[&>svg]:size-4 para:[&>svg]:shrink-0',
        'para:group-data-[collapsible=icon]:-mt-8 para:group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        'para:text-sidebar-foreground para:ring-sidebar-ring para:hover:bg-sidebar-accent para:hover:text-sidebar-accent-foreground para:absolute para:top-3.5 para:right-3 para:flex para:aspect-square para:w-5 para:items-center para:justify-center para:rounded-md para:p-0 para:outline-hidden para:transition-transform para:focus-visible:ring-2 para:[&>svg]:size-4 para:[&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'para:after:absolute para:after:-inset-2 para:md:after:hidden',
        'para:group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={(cn('para:w-full para:text-sm'), className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('para:flex para:w-full para:min-w-0 para:flex-col para:gap-1', className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('para:group/menu-item para:relative', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  'para:peer/menu-button para:flex para:w-full para:items-center para:gap-2 para:overflow-hidden para:rounded-sm para:p-2 para:text-left para:text-sm para:outline-hidden para:ring-sidebar-ring para:transition-[width,height,padding] para:hover:bg-sidebar-accent para:hover:text-sidebar-accent-foreground para:focus-visible:ring-2 para:active:bg-sidebar-accent para:active:text-sidebar-accent-foreground para:disabled:pointer-events-none para:disabled:opacity-50 para:group-has-data-[sidebar=menu-action]/menu-item:pr-8 para:aria-disabled:pointer-events-none para:aria-disabled:opacity-50 para:data-[active=true]:border para:data-[active=true]:border-border para:data-[active=true]:bg-sidebar-accent para:data-[active=true]:font-medium para:data-[active=true]:text-sidebar-accent-foreground para:data-[state=open]:hover:bg-sidebar-accent para:data-[state=open]:hover:text-sidebar-accent-foreground para:group-data-[collapsible=icon]:size-8! para:group-data-[collapsible=icon]:p-2! para:[&>span:last-child]:truncate para:[&>svg]:size-4 para:[&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'para:hover:bg-sidebar-accent para:hover:text-sidebar-accent-foreground',
        outline:
          'para:bg-background para:shadow-[0_0_0_1px_hsl(var(--sidebar-border))] para:hover:bg-sidebar-accent para:hover:text-sidebar-accent-foreground para:hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'para:h-8 para:text-sm',
        sm: 'para:h-7 para:text-xs',
        lg: 'para:h-12 para:text-sm para:group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== 'collapsed' || isMobile} {...tooltip} />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        'para:text-sidebar-foreground para:ring-sidebar-ring para:hover:bg-sidebar-accent para:hover:text-sidebar-accent-foreground para:peer-hover/menu-button:text-sidebar-accent-foreground para:absolute para:top-1.5 para:right-1 para:flex para:aspect-square para:w-5 para:items-center para:justify-center para:rounded-md para:p-0 para:outline-hidden para:transition-transform para:focus-visible:ring-2 para:[&>svg]:size-4 para:[&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'para:after:absolute para:after:-inset-2 para:md:after:hidden',
        'para:peer-data-[size=sm]/menu-button:top-1',
        'para:peer-data-[size=default]/menu-button:top-1.5',
        'para:peer-data-[size=lg]/menu-button:top-2.5',
        'para:group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'para:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground para:group-focus-within/menu-item:opacity-100 para:group-hover/menu-item:opacity-100 para:data-[state=open]:opacity-100 para:md:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'para:text-sidebar-foreground para:pointer-events-none para:absolute para:right-1 para:flex para:h-5 para:min-w-5 para:items-center para:justify-center para:rounded-md para:px-1 para:text-xs para:font-medium para:tabular-nums para:select-none',
        'para:peer-hover/menu-button:text-sidebar-accent-foreground para:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
        'para:peer-data-[size=sm]/menu-button:top-1',
        'para:peer-data-[size=default]/menu-button:top-1.5',
        'para:peer-data-[size=lg]/menu-button:top-2.5',
        'para:group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn('para:flex para:h-8 para:items-center para:gap-2 para:rounded-md para:px-2', className)}
      {...props}
    >
      {showIcon && <Skeleton className={'para:size-4 para:rounded-md'} data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className={'para:h-4 para:max-w-(--skeleton-width) para:flex-1'}
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        'para:border-border para:mx-3.5 para:flex para:min-w-0 para:translate-x-px para:flex-col para:gap-1 para:border-l para:px-2.5 para:py-0.5',
        'para:group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('para:group/menu-sub-item para:relative', className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md';
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'para:text-sidebar-foreground para:ring-sidebar-ring para:hover:bg-sidebar-accent para:hover:text-sidebar-accent-foreground para:active:bg-sidebar-accent para:active:text-sidebar-accent-foreground para:[&>svg]:text-sidebar-accent-foreground para:flex para:h-7 para:min-w-0 para:-translate-x-px para:items-center para:gap-2 para:overflow-hidden para:rounded-md para:px-2 para:outline-hidden para:focus-visible:ring-2 para:disabled:pointer-events-none para:disabled:opacity-50 para:aria-disabled:pointer-events-none para:aria-disabled:opacity-50 para:[&>span:last-child]:truncate para:[&>svg]:size-4 para:[&>svg]:shrink-0',
        'para:data-[active=true]:bg-sidebar-accent para:data-[active=true]:text-sidebar-accent-foreground',
        size === 'sm' && 'para:text-xs',
        size === 'md' && 'para:text-sm',
        'para:group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
