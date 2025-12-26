<script setup lang="ts">
import { ref } from "vue";
import { useAccount } from "@/composables/useAccount";

const MESSAGE = "Hello World!";

const { signMessage } = useAccount();
const isPending = ref(false);
const signature = ref<string | null>(null);
const error = ref<string | null>(null);

async function handleSign() {
  if (isPending.value) return;

  isPending.value = true;
  error.value = null;

  try {
    signature.value = await signMessage(MESSAGE);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to sign message";
    signature.value = null;
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div v-if="error" class="mb-4 p-4 border border-gray-400 bg-gray-200">
    <p class="text-sm text-gray-900">{{ error }}</p>
  </div>

  <div v-if="isPending" class="mb-4 p-4 border border-gray-300 bg-gray-100">
    <p class="text-sm text-gray-700">Signing '{{ MESSAGE }}'...</p>
  </div>

  <div v-if="signature && !isPending" class="mb-4 p-4 border border-gray-200 bg-gray-50">
    <p class="text-sm text-gray-800">'{{ MESSAGE }}' signed successfully!</p>
  </div>

  <div class="bg-white border border-gray-200 p-6 mb-4">
    <h3 class="text-lg font-medium mb-4">Sign Message</h3>
    <div class="space-y-4">
      <div class="p-4 bg-gray-50 border border-gray-200">
        <p class="text-sm text-gray-600 mb-1">Message to sign:</p>
        <p class="text-lg font-mono font-semibold">{{ MESSAGE }}</p>
      </div>
      <button
        type="button"
        :disabled="isPending"
        class="w-full px-4 py-2 bg-gray-900 text-white hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        @click="handleSign"
      >
        {{ isPending ? "Signing..." : `Sign ${MESSAGE}` }}
      </button>
    </div>
  </div>

  <div v-if="signature" class="bg-white border border-gray-200 p-6">
    <h3 class="text-lg font-medium mb-2">Signature</h3>
    <div
      class="bg-gray-50 p-4 border border-gray-200 break-all"
      data-testid="sign-signature-display"
    >
      <code class="text-sm text-gray-800 font-mono">{{ signature }}</code>
    </div>
  </div>
</template>
