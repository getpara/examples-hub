<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

defineProps<{
  verifyUrl: string;
}>();

const emit = defineEmits<{
  complete: [];
  cancel: [];
}>();

// Para portal base URL for origin validation
const portalOrigins = [
  "https://app.getpara.com",
  "https://app.beta.getpara.com",
  "https://app.dev.getpara.com",
];

function handleMessage(event: MessageEvent) {
  // Validate origin comes from Para portal
  const isValidOrigin = portalOrigins.some((origin) =>
    event.origin.startsWith(origin)
  );

  if (!isValidOrigin) return;

  // Handle CLOSE_WINDOW message from Para portal
  if (event.data?.type === "CLOSE_WINDOW") {
    if (event.data?.success) {
      emit("complete");
    } else {
      emit("cancel");
    }
  }
}

onMounted(() => {
  window.addEventListener("message", handleMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">Complete verification below</p>
      <button
        type="button"
        class="text-sm text-gray-500 hover:text-gray-700"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>

    <iframe
      :src="verifyUrl"
      title="Para Verification"
      class="w-full h-[400px] border border-gray-200"
      allow="publickey-credentials-get *; publickey-credentials-create *"
    />
  </div>
</template>
