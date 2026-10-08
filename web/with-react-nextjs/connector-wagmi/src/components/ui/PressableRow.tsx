import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@/lib/classNames";

export type PressableRowPosition = "standalone" | "group-first" | "group-middle" | "group-last";

interface PressableRowProps extends Omit<ComponentPropsWithoutRef<"button">, "title"> {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  position?: PressableRowPosition;
  tone?: "default" | "accent";
}

const POSITION_CLASSES: Record<PressableRowPosition, string> = {
  standalone: "border-y",
  "group-first": "border-t",
  "group-middle": "before:absolute before:top-0 before:right-0 before:left-17 before:border-t before:border-border",
  "group-last":
    "border-b before:absolute before:top-0 before:right-0 before:left-17 before:border-t before:border-border",
};

export function PressableRow({
  title,
  subtitle,
  leading,
  trailing,
  position = "standalone",
  tone = "default",
  className,
  type = "button",
  ...buttonProps
}: PressableRowProps) {
  const iconTone = tone === "accent" ? "text-accent" : "text-foreground";

  return (
    <button
      type={type}
      className={cx(
        "focus-ring state-layer relative flex min-h-16 w-full cursor-pointer items-center gap-4 border-border px-gutter py-4 text-left text-foreground",
        POSITION_CLASSES[position],
        className
      )}
      {...buttonProps}>
      {leading && (
        <span
          aria-hidden="true"
          className={cx(
            "inline-flex size-8 flex-none items-center justify-center border border-border bg-background",
            iconTone
          )}>
          {leading}
        </span>
      )}
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="truncate text-body font-medium">{title}</span>
        {subtitle && <span className="truncate text-caption text-muted">{subtitle}</span>}
      </span>
      {trailing && (
        <span aria-hidden="true" className={cx("inline-flex flex-none items-center", tone === "accent" ? "text-accent" : "text-muted")}>
          {trailing}
        </span>
      )}
    </button>
  );
}
