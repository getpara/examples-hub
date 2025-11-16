<template>
  <button
    @click="$emit('click')"
    :disabled="disabled || isLoading"
    :class="buttonClasses"
    v-bind="$attrs"
  >
    <span v-if="isLoading" class="flex items-center justify-center gap-2">
      <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      {{ loadingText }}
    </span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  isLoading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary';
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  disabled: false,
  loadingText: 'Loading...',
  variant: 'primary',
});

defineEmits<{
  click: [];
}>();

const buttonClasses = computed(() => {
  const base = 'w-full px-4 py-2 font-medium rounded-none transition-colors disabled:cursor-not-allowed';
  
  if (props.variant === 'primary') {
    return `${base} bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400`;
  } else {
    return `${base} border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50`;
  }
});
</script>