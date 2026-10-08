<script lang="ts" module>
  export type BadgeVariant = "solid" | "outline" | "success" | "accent";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { cx } from "@/lib/classNames";

  interface Props {
    variant?: BadgeVariant;
    children: Snippet;
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

  let { variant = "outline", children, className }: Props = $props();

  const dotClass = $derived(DOT_CLASSES[variant]);
</script>

<span
  class={cx(
    "inline-flex items-center gap-1 border px-2 py-0.5 text-label whitespace-nowrap",
    VARIANT_CLASSES[variant],
    className
  )}>
  {#if dotClass}
    <span aria-hidden="true" class={cx("size-1.5 flex-none rounded-full", dotClass)}></span>
  {/if}
  {@render children()}
</span>
