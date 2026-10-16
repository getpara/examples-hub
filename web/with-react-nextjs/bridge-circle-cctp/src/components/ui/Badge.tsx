import type { ReactNode } from "react";
import { cx } from "@/lib/classNames";

export type BadgeVariant = "solid" | "outline" | "success" | "accent";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  solid: "border-transparent bg-primary text-on-primary",
  outline: "border-border-strong bg-transparent text-foreground",
  success: "border-border bg-surface text-foreground",
  accent: "border-border bg-surface text-foreground",
};

const DOT_CLASSES: Partial<Record<BadgeVariant, string>> = {
  success: "bg-success",
  accent: "bg-accent",
};

export function Badge({ variant = "outline", children, className }: BadgeProps) {
  const dotClass = DOT_CLASSES[variant];

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 border px-2 py-0.5 text-label whitespace-nowrap",
        VARIANT_CLASSES[variant],
        className
      )}>
      {dotClass && <span aria-hidden="true" className={cx("size-1.5 flex-none rounded-full", dotClass)} />}
      {children}
    </span>
  );
}
