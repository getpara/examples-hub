<script lang="ts">
export interface SelectFieldOption {
  value: string;
  label: string;
}
</script>

<script setup lang="ts">
import { computed, useId } from "vue";
import Icon from "@/components/ui/Icon.vue";
import { cx } from "@/lib/classNames";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  label: string;
  options: ReadonlyArray<SelectFieldOption>;
  hint?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}>();

const value = defineModel<string>({ default: "" });

const generatedId = useId();
const selectId = computed(() => props.id ?? generatedId);
const hintId = computed(() => `${selectId.value}-hint`);
</script>

<template>
  <div :class="cx('grid min-w-0 gap-2', disabled && 'opacity-50', className)">
    <label
      :for="selectId"
      class="truncate text-label tracking-ui">
      {{ label }}
    </label>
    <div
      class="relative flex min-h-control-md items-stretch border border-border-strong bg-surface transition-[border-color,box-shadow] duration-200 ease-brand focus-within:border-foreground focus-within:shadow-[inset_0_-2px_0_var(--color-accent)] motion-reduce:transition-none">
      <select
        :id="selectId"
        v-model="value"
        :disabled="disabled"
        :aria-describedby="hint ? hintId : undefined"
        class="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-10 pl-3 text-body text-foreground outline-none disabled:cursor-not-allowed"
        v-bind="$attrs">
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <Icon
        name="caret-down"
        class-name="pointer-events-none absolute top-1/2 right-3 size-icon-sm -translate-y-1/2 text-muted" />
    </div>
    <p
      v-if="hint"
      :id="hintId"
      class="text-caption text-muted">
      {{ hint }}
    </p>
  </div>
</template>
