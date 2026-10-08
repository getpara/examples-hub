import type { ReactNode } from "react";
import { cx } from "@/lib/classNames";
import { Icon, type IconName } from "@/components/ui/Icon";

export type AlertVariant = "info" | "success" | "warning" | "destructive";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
  testId?: string;
}

const EDGE_CLASSES: Record<AlertVariant, string> = {
  info: "border-l-foreground",
  success: "border-l-success",
  warning: "border-l-warning",
  destructive: "border-l-destructive",
};

const ICON_CLASSES: Record<AlertVariant, string> = {
  info: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const ICON_NAMES: Record<AlertVariant, IconName> = {
  info: "info",
  success: "check",
  warning: "warning",
  destructive: "warning",
};

export function Alert({ variant = "info", title, children, className, testId }: AlertProps) {
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      data-testid={testId}
      className={cx(
        "flex items-start gap-3 border border-l-2 border-border bg-surface p-4 text-foreground",
        EDGE_CLASSES[variant],
        className
      )}>
      <Icon name={ICON_NAMES[variant]} className={cx("mt-0.5 size-icon-md", ICON_CLASSES[variant])} />
      <div className="grid min-w-0 gap-1">
        {title && <p className="text-body font-medium">{title}</p>}
        {children && <div className="text-caption break-words text-muted">{children}</div>}
      </div>
    </div>
  );
}
