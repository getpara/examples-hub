<template>
  <main class="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
    <h1 class="text-2xl font-bold">Para + Wagmi Example</h1>
    <p class="max-w-md text-center">
      This minimal example demonstrates how to integrate the Para Modal using the Wagmi SDK in a Vue project.
    </p>
    <p class="max-w-md text-center">
      Use the Wagmi SDK when you're trying to create your own custom wallet connection modal.
    </p>
    <WalletDisplay
      v-if="isConnected"
      :wallet-address="address" />
    <WalletConnectors v-else />
  </main>
</template>

<script setup>
  import { useAccount } from "@wagmi/vue";
  import WalletDisplay from "./components/WalletDisplay.vue";
  import WalletConnectors from "./components/WalletConnectors.vue";

  const { address, isConnected } = useAccount();
  console.log("address", address.value);
  console.log("isConnected", isConnected.value);
</script>
