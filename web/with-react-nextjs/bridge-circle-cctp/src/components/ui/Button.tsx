import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import { cx } from "@/lib/classNames";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-primary text-on-primary",
  secondary: "border-transparent bg-secondary text-on-secondary",
  outline: "border-border bg-surface text-foreground",
  ghost: "border-transparent bg-transparent text-foreground",
  destructive: "border-transparent bg-destructive text-on-destructive",
  link: "border-transparent bg-transparent text-foreground underline decoration-border-strong underline-offset-[5px] active:decoration-foreground",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-control-sm px-3",
  md: "min-h-control-md px-control-x",
  lg: "min-h-control-lg px-control-x",
  icon: "size-control-md p-0",
};

const DISABLED_CLASSES: Record<ButtonVariant, string> = {
  primary: "cursor-not-allowed border-transparent bg-surface-muted text-muted",
  secondary: "cursor-not-allowed border-transparent bg-surface-muted text-muted",
  outline: "cursor-not-allowed border-border bg-surface-muted text-muted",
  ghost: "cursor-not-allowed border-transparent bg-transparent text-muted",
  destructive: "cursor-not-allowed border-transparent bg-surface-muted text-muted",
  link: "cursor-not-allowed border-transparent bg-transparent text-muted underline decoration-border-strong underline-offset-[5px]",
};

const ARROW_DOTS: Array<[number, number]> = [
  [8, 0],
  [12, 4],
  [0, 8],
  [4, 8],
  [8, 8],
  [12, 8],
  [16, 8],
  [12, 12],
  [8, 16],
];

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  onClick,
  ...buttonProps
}: ButtonProps) {
  const isDisabled = Boolean(disabled) && !isLoading;
  const isIconOnly = size === "icon";
  const showsArrow = variant === "primary" && !isIconOnly;
  const hidesContentWhileLoading = isLoading && variant !== "primary";

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={isLoading || undefined}
      aria-busy={isLoading || undefined}
      className={cx(
        "focus-ring relative inline-flex items-center gap-2 border text-label tracking-ui whitespace-nowrap transition-[background-color,border-color,color,opacity,transform] duration-200 ease-brand motion-reduce:transition-none",
        variant === "link" ? "min-h-control-md px-0" : SIZE_CLASSES[size],
        showsArrow ? "justify-between" : "justify-center",
        isDisabled ? DISABLED_CLASSES[variant] : VARIANT_CLASSES[variant],
        !isDisabled && !isLoading && variant !== "link" && "state-layer cursor-pointer",
        !isDisabled && !isLoading && variant === "link" && "cursor-pointer",
        isLoading && "cursor-progress",
        fullWidth && "w-full",
        className
      )}
      {...buttonProps}
      onClick={handleClick}>
      {hidesContentWhileLoading && (
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto size-icon-sm animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      )}
      {icon && (
        <span
          aria-hidden="true"
          className={cx(
            "inline-flex size-icon-md flex-none items-center justify-center",
            hidesContentWhileLoading && "opacity-0"
          )}>
          {icon}
        </span>
      )}
      <span
        className={cx(
          isIconOnly ? "sr-only" : "inline-flex items-center transition-opacity",
          hidesContentWhileLoading && "opacity-0",
          isLoading && variant === "primary" && "opacity-65"
        )}>
        {children}
      </span>
      {showsArrow && (
        <svg
          viewBox="0 0 18 18"
          aria-hidden="true"
          className={cx("size-[18px] flex-none overflow-hidden", isDisabled ? "fill-current" : "fill-accent")}>
          <g className={isLoading ? "animate-arrow-march motion-reduce:animate-none" : undefined}>
            {ARROW_DOTS.map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" />
            ))}
          </g>
        </svg>
      )}
    </button>
  );
}
