import { useId, type ReactNode } from "react";

interface FieldGroupProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function FieldGroup({ title, action, children }: FieldGroupProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="grid gap-4 border border-border bg-surface p-4">
      <header className="flex min-h-7 items-center justify-between gap-4">
        <h3 id={titleId} className="font-mono text-mono-label text-muted uppercase">
          {title}
        </h3>
        {action}
      </header>
      {children}
    </section>
  );
}
