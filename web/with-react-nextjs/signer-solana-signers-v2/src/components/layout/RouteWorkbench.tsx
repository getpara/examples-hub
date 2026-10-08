import type { ReactNode } from "react";

interface RouteWorkbenchProps {
  nav: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}

export function RouteWorkbench({ nav, children, aside }: RouteWorkbenchProps) {
  return (
    <div className="mx-auto grid w-full max-w-sheet flex-1 grid-cols-1 content-start border-border md:border-x lg:grid-cols-[272px_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:content-stretch xl:grid-cols-[272px_minmax(0,1fr)_440px] xl:grid-rows-none">
      <div className="min-w-0 lg:row-span-2 lg:border-r lg:border-border xl:row-span-1">{nav}</div>
      <div className="grid min-w-0 content-start divide-y divide-border">{children}</div>
      {aside && (
        <div className="min-w-0 border-t border-border lg:col-start-2 xl:col-start-3 xl:border-t-0 xl:border-l">{aside}</div>
      )}
    </div>
  );
}
