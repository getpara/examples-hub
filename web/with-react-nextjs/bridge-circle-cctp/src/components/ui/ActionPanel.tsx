import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "@/lib/classNames";

interface ActionPanelProps extends Omit<ComponentPropsWithoutRef<"section">, "title"> {
  title: string;
  api?: string;
  description?: ReactNode;
  actions?: ReactNode;
  hint?: ReactNode;
}

export function ActionPanel({ title, api, description, actions, hint, children, className, ...sectionProps }: ActionPanelProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cx("grid content-start gap-6 px-gutter pt-8 pb-10 md:px-sheet-x", className)}
      {...sectionProps}>
      <header className="grid gap-2">
        <h2 id={titleId} className="text-heading tracking-snug md:text-title">
          {title}
        </h2>
        {api && <code className="font-mono text-code break-words text-muted">{api}</code>}
      </header>
      {description && <p className="max-w-[56ch] text-caption text-muted">{description}</p>}
      {children && <div className="grid max-w-field gap-5">{children}</div>}
      {(actions || hint) && (
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {actions}
          {hint && <p className="text-caption text-muted">{hint}</p>}
        </div>
      )}
    </section>
  );
}
