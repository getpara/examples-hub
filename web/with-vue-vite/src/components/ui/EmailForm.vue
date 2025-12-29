<script setup lang="ts">
import { ref } from "vue";
import { useEmailAuth } from "@/composables/auth/useEmailAuth";

defineProps<{
  isPending: boolean;
}>();

const { submit } = useEmailAuth();
const email = ref("");

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!email.value.trim()) return;
  await submit(email.value.trim());
}
</script>

<template>
  <form @submit="handleSubmit" class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        Email Address
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="you@example.com"
        :disabled="isPending"
        required
        data-testid="email-input"
        class="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    <button
      type="submit"
      :disabled="!email.trim() || isPending"
      data-testid="continue-email-button"
      class="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {{ isPending ? "Signing in..." : "Continue with Email" }}
    </button>
  </form>
</template>
