<template>
  <div class="text-center flex flex-col gap-2">
    <h2
      class="text-xl font-bold"
      data-testid="logged-in-message">
      You are logged in!
    </h2>
    <p
      v-if="walletAddress"
      data-testid="wallet-address">
      Your first wallet address is: <strong>{{ walletAddress }}</strong>
    </p>
    <p v-else>No wallet found.</p>
  </div>
</template>

<script setup lang="ts">
  import { defineProps } from "vue";

  interface Props {
    walletAddress?: string;
  }

  defineProps<Props>();
</script>
