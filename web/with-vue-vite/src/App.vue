<script setup lang="ts">
import { onMounted } from "vue";
import Header from "./components/layout/Header.vue";
import CombinedAuth from "./components/ui/CombinedAuth.vue";
import WalletInfo from "./components/ui/WalletInfo.vue";
import SignMessage from "./components/ui/SignMessage.vue";
import { useAccount } from "@/composables/useAccount";

const { isConnected, checkAuthentication } = useAccount();

onMounted(() => {
  checkAuthentication();
});
</script>

<template>
  <Header />

  <div class="container mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold tracking-tight mb-4">
        Para Custom Auth Demo
      </h1>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Sign messages with your Para wallet using email, phone, or social
        authentication. This demonstrates using Para's web-sdk with native Vue
        components and a unified authentication flow.
      </p>
    </div>

    <div v-if="!isConnected" data-testid="not-logged-in">
      <CombinedAuth />
    </div>

    <div v-else class="max-w-xl mx-auto" data-testid="wallet-connected">
      <WalletInfo />
      <SignMessage />
    </div>
  </div>
</template>