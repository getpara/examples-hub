import type { ReactNode } from "react";

interface AppShellProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function AppShell({ header, footer, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {header}
      <main className="flex flex-1 flex-col">{children}</main>
      {footer}
    </div>
  );
}
