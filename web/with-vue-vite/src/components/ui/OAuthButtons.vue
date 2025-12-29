<script setup lang="ts">
import { useOAuthAuth } from "@/composables/auth/useOAuthAuth";
import { OAUTH_PROVIDERS } from "@/constants/auth";
import type { TOAuthMethod } from "@getpara/web-sdk";

defineProps<{
  isPending: boolean;
}>();

const { state, authenticate } = useOAuthAuth();

function handleClick(method: TOAuthMethod) {
  authenticate(method);
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-gray-600 text-center mb-4">
      Sign in with your social account
    </p>

    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="provider in OAUTH_PROVIDERS"
        :key="provider.method"
        type="button"
        :disabled="isPending"
        :class="[
          'flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors',
          isPending && state.provider === provider.method ? 'bg-gray-100' : '',
        ]"
        @click="handleClick(provider.method)"
      >
        <img :src="provider.icon" :alt="provider.label" class="w-5 h-5" />
        <span>{{ provider.label }}</span>
      </button>
    </div>

    <p v-if="isPending" class="text-sm text-gray-500 text-center mt-4">
      Complete authentication in the popup window...
    </p>
  </div>
</template>
