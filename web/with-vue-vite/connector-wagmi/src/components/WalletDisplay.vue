<template>
  <div class="text-center flex flex-col gap-2">
    <h2 class="text-xl font-bold">You are logged in!</h2>
    <p v-if="walletAddress">
      Your first wallet address is: <strong>{{ walletAddress }}</strong>
    </p>
    <p v-else>No wallet found.</p>
  </div>
</template>

<script setup>
  defineProps({
    walletAddress: {
      type: String,
      default: undefined,
    },
  });
</script>
