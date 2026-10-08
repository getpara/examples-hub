<script setup lang="ts">
import { cx } from "@/lib/classNames";

withDefaults(defineProps<{ label: string; isWide?: boolean; isMedium?: boolean; isBusy?: boolean }>(), {
  isWide: false,
  isMedium: false,
  isBusy: false,
});
</script>

<template>
  <div
    :aria-busy="isBusy || undefined"
    :class="
      cx(
        'grid min-w-0 flex-1 content-center gap-2 border-border px-gutter py-4 md:px-sheet-x',
        isWide ? 'md:flex-[2.4_1_0]' : isMedium ? 'md:flex-[1.6_1_0]' : 'md:flex-[1_1_0]'
      )
    ">
    <span class="font-mono text-mono-label text-muted uppercase">{{ label }}</span>
    <div class="flex min-h-7 min-w-0 items-center gap-2"><slot /></div>
  </div>
</template>
