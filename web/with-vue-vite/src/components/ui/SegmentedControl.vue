<script lang="ts">
export interface SegmentedControlOption<Value extends string> {
  value: Value;
  label: string;
  testId?: string;
}
</script>

<script setup lang="ts" generic="Value extends string">
import { computed } from "vue";
import { cx } from "@/lib/classNames";

const props = withDefaults(
  defineProps<{
    label: string;
    options: ReadonlyArray<SegmentedControlOption<Value>>;
    value: Value;
    onChange: (value: Value) => void;
    disabled?: boolean;
    className?: string;
  }>(),
  { disabled: false, className: undefined }
);

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp"];

const selectedIndex = computed(() => props.options.findIndex((option) => option.value === props.value));

function moveSelection(event: KeyboardEvent) {
  const step = NEXT_KEYS.includes(event.key) ? 1 : PREVIOUS_KEYS.includes(event.key) ? -1 : 0;

  if (step === 0 || props.disabled || props.options.length === 0) {
    return;
  }

  event.preventDefault();
  const nextIndex = (Math.max(selectedIndex.value, 0) + step + props.options.length) % props.options.length;
  props.onChange(props.options[nextIndex].value);
  const group = event.currentTarget as HTMLElement;
  group.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
}
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    :class="cx('flex border border-border bg-surface text-label tracking-ui', className)"
    @keydown="moveSelection">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="option.value === value"
      :tabindex="option.value === value || (selectedIndex === -1 && index === 0) ? 0 : -1"
      :disabled="disabled && option.value !== value"
      :data-testid="option.testId"
      :class="
        cx(
          'focus-ring inline-flex min-h-[calc(var(--spacing-control-md)-2px)] flex-1 items-center justify-center gap-2 px-3 whitespace-nowrap transition-colors duration-200 ease-brand motion-reduce:transition-none',
          index > 0 && 'border-l border-border',
          option.value === value ? 'bg-primary text-on-primary' : 'text-muted',
          option.value !== value && !disabled && 'cursor-pointer hover:text-foreground',
          option.value !== value && disabled && 'cursor-not-allowed opacity-50'
        )
      "
      @click="onChange(option.value)">
      {{ option.label }}
    </button>
  </div>
</template>
