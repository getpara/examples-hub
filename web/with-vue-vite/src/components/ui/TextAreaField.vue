<script setup lang="ts">
import { computed, useId } from "vue";
import { cx } from "@/lib/classNames";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label: string;
    hint?: string;
    error?: string;
    id?: string;
    className?: string;
    disabled?: boolean;
    rows?: number;
  }>(),
  { hint: undefined, error: undefined, id: undefined, className: undefined, disabled: false, rows: 3 }
);

const value = defineModel<string>({ default: "" });

const generatedId = useId();
const textAreaId = computed(() => props.id ?? generatedId);
const messageId = computed(() => `${textAreaId.value}-message`);
const message = computed(() => props.error ?? props.hint);
</script>

<template>
  <div :class="cx('grid min-w-0 gap-2', disabled && 'opacity-50', className)">
    <label
      :for="textAreaId"
      class="text-label tracking-ui">
      {{ label }}
    </label>
    <textarea
      :id="textAreaId"
      v-model="value"
      :rows="rows"
      :disabled="disabled"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="message ? messageId : undefined"
      :class="
        cx(
          'min-h-[88px] w-full resize-none border bg-surface px-3 py-2 text-body text-foreground caret-accent outline-none [overflow-wrap:anywhere] transition-[border-color,box-shadow] duration-200 ease-brand placeholder:text-muted disabled:cursor-not-allowed motion-reduce:transition-none',
          error
            ? 'border-destructive shadow-[inset_0_-2px_0_var(--color-destructive)]'
            : 'border-border-strong focus:border-foreground focus:shadow-[inset_0_-2px_0_var(--color-accent)]'
        )
      "
      v-bind="$attrs" />
    <p
      v-if="message"
      :id="messageId"
      :class="cx('text-caption', error ? 'text-destructive' : 'text-muted')">
      {{ message }}
    </p>
  </div>
</template>
