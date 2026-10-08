<script lang="ts">
export type AlertVariant = "info" | "success" | "warning" | "destructive";
</script>

<script setup lang="ts">
import { useSlots } from "vue";
import Icon, { type IconName } from "@/components/ui/Icon.vue";
import { cx } from "@/lib/classNames";

withDefaults(defineProps<{ variant?: AlertVariant; title?: string; className?: string; testId?: string }>(), {
  variant: "info",
  title: undefined,
  className: undefined,
  testId: undefined,
});

const slots = useSlots();

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
</script>

<template>
  <div
    :role="variant === 'destructive' ? 'alert' : 'status'"
    :data-testid="testId"
    :class="cx('flex items-start gap-3 border border-l-2 border-border bg-surface p-4 text-foreground', EDGE_CLASSES[variant], className)">
    <Icon
      :name="ICON_NAMES[variant]"
      :class-name="cx('mt-0.5 size-icon-md', ICON_CLASSES[variant])" />
    <div class="grid min-w-0 gap-1">
      <p
        v-if="title"
        class="text-body font-medium">
        {{ title }}
      </p>
      <div
        v-if="slots.default"
        class="text-caption break-words text-muted">
        <slot />
      </div>
    </div>
  </div>
</template>
