<script lang="ts" module>
  export type AlertVariant = "info" | "success" | "warning" | "destructive";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { cx } from "@/lib/classNames";
  import Icon, { type IconName } from "@/components/ui/Icon.svelte";

  interface Props {
    variant?: AlertVariant;
    title?: string;
    children?: Snippet;
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

  let { variant = "info", title, children, className, testId }: Props = $props();
</script>

<div
  role={variant === "destructive" ? "alert" : "status"}
  data-testid={testId}
  class={cx(
    "flex items-start gap-3 border border-l-2 border-border bg-surface p-4 text-foreground",
    EDGE_CLASSES[variant],
    className
  )}>
  <Icon name={ICON_NAMES[variant]} className={cx("mt-0.5 size-icon-md", ICON_CLASSES[variant])} />
  <div class="grid min-w-0 gap-1">
    {#if title}
      <p class="text-body font-medium">{title}</p>
    {/if}
    {#if children}
      <div class="text-caption break-words text-muted">{@render children()}</div>
    {/if}
  </div>
</div>
