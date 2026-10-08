<script setup lang="ts">
import { useId } from "vue";

withDefaults(defineProps<{ title?: string; description: string; network: string; footnote?: string }>(), {
  title: "Sign in",
  footnote: "Secured by Para",
});

const titleId = useId();
</script>

<template>
  <div class="grid justify-items-stretch px-gutter py-6 md:justify-items-center md:px-sheet-x md:py-16">
    <section
      :aria-labelledby="titleId"
      class="grid w-full max-w-auth gap-6 border border-border bg-surface p-6 md:p-8">
      <header class="grid gap-2">
        <img
          src="/para-mark.svg"
          alt=""
          width="28"
          height="27"
          class="mb-4 h-[27px] w-7" />
        <h2
          :id="titleId"
          class="text-title tracking-snug">
          {{ title }}
        </h2>
        <p class="text-caption text-muted">{{ description }}</p>
      </header>
      <div class="grid gap-4"><slot /></div>
      <footer class="flex items-center justify-between gap-4 border-t border-border pt-4 text-caption text-muted">
        <span class="font-mono text-mono-label uppercase">{{ network }}</span>
        <span>{{ footnote }}</span>
      </footer>
    </section>
  </div>
</template>
