<script setup lang="ts">
import { computed, useId } from "vue";
import { cx } from "@/lib/classNames";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  label: string;
  hint?: string;
  error?: string;
  prefix?: string;
  trailing?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}>();

const value = defineModel<string>({ default: "" });

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const messageId = computed(() => `${inputId.value}-message`);
const message = computed(() => props.error ?? props.hint);
</script>

<template>
  <div :class="cx('grid min-w-0 gap-2', disabled && 'opacity-50', className)">
    <label
      :for="inputId"
      class="truncate text-label tracking-ui">
      {{ label }}
    </label>
    <div
      :class="
        cx(
          'flex min-h-control-lg items-stretch border bg-surface transition-[border-color,box-shadow] duration-200 ease-brand motion-reduce:transition-none',
          error
            ? 'border-destructive shadow-[inset_0_-2px_0_var(--color-destructive)]'
            : 'border-border-strong focus-within:border-foreground focus-within:shadow-[inset_0_-2px_0_var(--color-accent)]'
        )
      ">
      <span
        v-if="prefix"
        class="flex flex-none items-center gap-1 border-r border-border pr-3 pl-4 text-body font-medium">
        {{ prefix }}
      </span>
      <input
        :id="inputId"
        v-model="value"
        :disabled="disabled"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="message ? messageId : undefined"
        class="min-w-0 flex-1 bg-transparent px-4 text-body text-foreground caret-accent outline-none placeholder:text-muted disabled:cursor-not-allowed"
        v-bind="$attrs" />
      <span
        v-if="trailing"
        class="flex flex-none items-center pr-4 text-caption text-muted">
        {{ trailing }}
      </span>
    </div>
    <p
      v-if="message"
      :id="messageId"
      :class="cx('text-caption', error ? 'text-destructive' : 'text-muted')">
      {{ message }}
    </p>
  </div>
</template>
