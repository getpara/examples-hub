<script lang="ts">
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";
</script>

<script setup lang="ts">
import { computed, ref, useSlots } from "vue";
import { cx } from "@/lib/classNames";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    className?: string;
    onClick?: (event: MouseEvent) => void;
  }>(),
  {
    variant: "primary",
    size: "md",
    isLoading: false,
    fullWidth: false,
    disabled: false,
    type: "button",
    className: undefined,
    onClick: undefined,
  }
);

const slots = useSlots();
const buttonElement = ref<HTMLButtonElement | null>(null);

defineExpose({ focus: () => buttonElement.value?.focus() });

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

const isDisabled = computed(() => props.disabled && !props.isLoading);
const isIconOnly = computed(() => props.size === "icon");
const showsArrow = computed(() => props.variant === "primary" && !isIconOnly.value);
const hidesContentWhileLoading = computed(() => props.isLoading && props.variant !== "primary");

function handleClick(event: MouseEvent) {
  if (props.isLoading) {
    event.preventDefault();
    return;
  }

  props.onClick?.(event);
}
</script>

<template>
  <button
    ref="buttonElement"
    :type="type"
    :disabled="disabled"
    :aria-disabled="isLoading || undefined"
    :aria-busy="isLoading || undefined"
    :class="
      cx(
        'focus-ring relative inline-flex items-center gap-2 border text-label tracking-ui whitespace-nowrap transition-[background-color,border-color,color,opacity,transform] duration-200 ease-brand motion-reduce:transition-none',
        variant === 'link' ? 'min-h-control-md px-0' : SIZE_CLASSES[size],
        showsArrow ? 'justify-between' : 'justify-center',
        isDisabled ? DISABLED_CLASSES[variant] : VARIANT_CLASSES[variant],
        !isDisabled && !isLoading && variant !== 'link' && 'state-layer cursor-pointer',
        !isDisabled && !isLoading && variant === 'link' && 'cursor-pointer',
        isLoading && 'cursor-progress',
        fullWidth && 'w-full',
        className
      )
    "
    @click="handleClick">
    <span
      v-if="hidesContentWhileLoading"
      aria-hidden="true"
      class="absolute inset-0 m-auto size-icon-sm animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
    <span
      v-if="slots.icon"
      aria-hidden="true"
      :class="cx('inline-flex size-icon-md flex-none items-center justify-center', hidesContentWhileLoading && 'opacity-0')">
      <slot name="icon" />
    </span>
    <span
      :class="
        cx(
          isIconOnly ? 'sr-only' : 'inline-flex items-center transition-opacity',
          hidesContentWhileLoading && 'opacity-0',
          isLoading && variant === 'primary' && 'opacity-65'
        )
      ">
      <slot />
    </span>
    <svg
      v-if="showsArrow"
      viewBox="0 0 18 18"
      aria-hidden="true"
      :class="cx('size-[18px] flex-none overflow-hidden', isDisabled ? 'fill-current' : 'fill-accent')">
      <g :class="isLoading ? 'animate-arrow-march motion-reduce:animate-none' : undefined">
        <rect
          v-for="[x, y] in ARROW_DOTS"
          :key="`${x}-${y}`"
          :x="x"
          :y="y"
          width="2"
          height="2" />
      </g>
    </svg>
  </button>
</template>
