<script setup lang="ts">
import type { AuthTab } from "@/composables/auth/useCombinedAuth";

defineProps<{
  activeTab: AuthTab;
}>();

const emit = defineEmits<{
  "update:activeTab": [tab: AuthTab];
}>();

const tabs: Array<{ id: AuthTab; label: string }> = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "social", label: "Social" },
];
</script>

<template>
  <div class="flex border-b border-gray-200 mb-6">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :class="[
        'flex-1 py-2 text-sm font-medium text-center transition-colors',
        activeTab === tab.id
          ? 'text-gray-900 border-b-2 border-gray-900'
          : 'text-gray-500 hover:text-gray-700',
      ]"
      @click="emit('update:activeTab', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
