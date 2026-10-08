<script setup lang="ts">
import { useId, useSlots } from "vue";
import { cx } from "@/lib/classNames";

defineProps<{ title: string; api?: string; description?: string; hint?: string; className?: string }>();

const slots = useSlots();
const titleId = useId();
</script>

<template>
  <section
    :aria-labelledby="titleId"
    :class="cx('grid content-start gap-6 px-gutter pt-8 pb-10 md:px-sheet-x', className)">
    <header class="grid gap-2">
      <h2
        :id="titleId"
        class="text-heading tracking-snug md:text-title">
        {{ title }}
      </h2>
      <code
        v-if="api"
        class="font-mono text-code break-words text-muted">
        {{ api }}
      </code>
    </header>
    <p
      v-if="description"
      class="max-w-[56ch] text-caption text-muted">
      {{ description }}
    </p>
    <div
      v-if="slots.default"
      class="grid max-w-field gap-5">
      <slot />
    </div>
    <div
      v-if="slots.actions || hint"
      class="flex flex-wrap items-center gap-4 pt-2">
      <slot name="actions" />
      <p
        v-if="hint"
        class="text-caption text-muted">
        {{ hint }}
      </p>
    </div>
  </section>
</template>
