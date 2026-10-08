import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@/lib/classNames";

interface LinkButtonProps extends ComponentPropsWithoutRef<"a"> {
  icon?: ReactNode;
}

export function LinkButton({ icon, className, children, ...anchorProps }: LinkButtonProps) {
  return (
    <a
      className={cx(
        "focus-ring state-layer relative inline-flex min-h-control-md cursor-pointer items-center justify-center gap-2 border border-border bg-surface px-control-x text-label tracking-ui whitespace-nowrap text-foreground transition-[background-color,border-color,color,opacity,transform] duration-200 ease-brand motion-reduce:transition-none",
        className
      )}
      {...anchorProps}>
      {icon && (
        <span aria-hidden="true" className="inline-flex size-icon-md flex-none items-center justify-center">
          {icon}
        </span>
      )}
      <span className="inline-flex items-center">{children}</span>
    </a>
  );
}
