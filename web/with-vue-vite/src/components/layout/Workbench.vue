<script setup lang="ts">
import { useSlots } from "vue";

const slots = useSlots();
</script>

<template>
  <div
    class="mx-auto grid w-full max-w-sheet flex-1 grid-cols-1 content-start border-border md:border-x lg:grid-cols-[minmax(0,1fr)_var(--spacing-aside)] lg:content-stretch">
    <div class="grid content-start divide-y divide-border"><slot /></div>
    <div
      v-if="slots.aside"
      class="border-t border-border lg:border-t-0 lg:border-l">
      <slot name="aside" />
    </div>
  </div>
</template>
