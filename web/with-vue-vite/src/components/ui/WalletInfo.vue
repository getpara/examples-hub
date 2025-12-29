<script setup lang="ts">
import { useAccount } from "@/composables/useAccount";

const { address } = useAccount();
</script>

<template>
  <div class="bg-white border border-gray-200 p-6 mb-4">
    <h3 class="text-lg font-medium mb-4">Connected Wallet</h3>
    <div class="bg-gray-50 p-4 border border-gray-200">
      <p class="text-sm text-gray-600 mb-1">Address</p>
      <p class="font-mono text-sm break-all">{{ address }}</p>
    </div>
  </div>
</template>
