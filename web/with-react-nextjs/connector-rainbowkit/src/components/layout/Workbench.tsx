import type { ReactNode } from "react";

interface WorkbenchProps {
  children: ReactNode;
  aside?: ReactNode;
}

export function Workbench({ children, aside }: WorkbenchProps) {
  return (
    <div className="mx-auto grid w-full max-w-sheet flex-1 grid-cols-1 content-start border-border md:border-x lg:grid-cols-[minmax(0,1fr)_var(--spacing-aside)] lg:content-stretch">
      <div className="grid content-start divide-y divide-border">{children}</div>
      {aside && <div className="border-t border-border lg:border-t-0 lg:border-l">{aside}</div>}
    </div>
  );
}
