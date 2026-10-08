<script setup lang="ts">
import { computed } from "vue";
import Icon from "@/components/ui/Icon.vue";

const props = withDefaults(
  defineProps<{ docsHref: string; sourceHref: string; examplesHref?: string; note?: string }>(),
  { examplesHref: "https://examples.getpara.com", note: "Testnet only. No real funds move." }
);

const LINK_CLASS =
  "focus-ring inline-flex items-center gap-1 text-muted transition-colors duration-200 ease-brand hover:text-foreground hover:underline hover:underline-offset-[3px]";

const resourceLinks = computed(() => [
  { label: "Docs", href: props.docsHref },
  { label: "Source", href: props.sourceHref },
  { label: "getpara.com", href: "https://getpara.com" },
]);
</script>

<template>
  <footer class="border-t border-border bg-background text-caption text-muted">
    <div
      class="mx-auto grid max-w-sheet gap-4 px-gutter py-6 md:flex md:min-h-header md:items-center md:gap-8 md:border-x md:border-border md:px-sheet-x md:py-0">
      <a
        :href="examplesHref"
        :class="`${LINK_CLASS} text-label`">
        <Icon
          name="caret-left"
          class-name="size-icon-sm" />
        All examples
      </a>
      <p class="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          class="size-1.5 flex-none bg-accent" />
        {{ note }}
      </p>
      <nav
        aria-label="Resources"
        class="flex flex-wrap gap-x-6 gap-y-2 md:ml-auto">
        <a
          v-for="link in resourceLinks"
          :key="link.label"
          :href="link.href"
          target="_blank"
          rel="noreferrer"
          :class="LINK_CLASS">
          {{ link.label }}
          <Icon
            name="arrow-up-right"
            class-name="size-icon-sm" />
        </a>
      </nav>
    </div>
  </footer>
</template>
