<script lang="ts">
export type BadgeVariant = "solid" | "outline" | "success" | "accent";
</script>

<script setup lang="ts">
import { cx } from "@/lib/classNames";

withDefaults(defineProps<{ variant?: BadgeVariant; className?: string }>(), {
  variant: "outline",
  className: undefined,
});

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
</script>

<template>
  <span
    :class="cx('inline-flex items-center gap-1 border px-2 py-0.5 text-label whitespace-nowrap', VARIANT_CLASSES[variant], className)">
    <span
      v-if="DOT_CLASSES[variant]"
      aria-hidden="true"
      :class="cx('size-1.5 flex-none rounded-full', DOT_CLASSES[variant])" />
    <slot />
  </span>
</template>
