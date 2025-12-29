<script setup lang="ts">
defineProps<{
  error?: string | null;
}>();
</script>

<template>
  <div class="bg-white border border-gray-200 p-6 w-full max-w-md mx-auto">
    <h2 class="text-xl font-semibold mb-6 text-center">Sign In</h2>

    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm"
    >
      {{ error }}
    </div>

    <slot />
  </div>
</template>
