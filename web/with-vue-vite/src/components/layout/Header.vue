<template>
  <header class="bg-white border-b border-gray-200">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-2">
          <img src="/para.svg" alt="Para Logo" class="w-8 h-8" />
          <span class="font-semibold text-lg">Para SDK</span>
        </div>

        <nav>
          <button
            v-if="isConnected"
            @click="handleDisconnect"
            class="px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors text-sm font-medium"
            data-testid="header-disconnect-button"
          >
            Disconnect
          </button>
          <button
            v-else
            @click="openModal"
            class="px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors text-sm font-medium"
            data-testid="header-connect-button"
          >
            Connect Wallet
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useParaAuth } from '@/composables/useParaAuth';

defineProps<{
  isConnected: boolean;
}>();

const { openModal, logout } = useParaAuth();

async function handleDisconnect() {
  try {
    await logout();
  } catch (error) {
    console.error('Failed to logout:', error);
  }
}
</script>