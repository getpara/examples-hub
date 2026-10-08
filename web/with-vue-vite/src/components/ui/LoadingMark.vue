<script setup lang="ts">
import { cx } from "@/lib/classNames";

withDefaults(defineProps<{ tone?: "accent" | "inverse"; className?: string }>(), {
  tone: "accent",
  className: undefined,
});

const DOTS: Array<[number, number]> = [
  [0, 0],
  [6, 0],
  [12, 0],
  [12, 6],
  [12, 12],
  [6, 12],
  [0, 12],
  [0, 6],
];
</script>

<template>
  <svg
    viewBox="0 0 14 14"
    aria-hidden="true"
    :class="cx('size-icon-md flex-none fill-current', tone === 'accent' ? 'text-accent' : 'text-on-primary', className)">
    <rect
      v-for="([x, y], index) in DOTS"
      :key="`${x}-${y}`"
      :x="x"
      :y="y"
      width="2"
      height="2"
      class="opacity-20 motion-safe:animate-loading-step motion-reduce:opacity-100"
      :style="{ animationDelay: `${index * 100}ms` }" />
  </svg>
</template>
