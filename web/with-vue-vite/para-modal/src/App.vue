<template>
  <main
    class="flex flex-col items-center justify-center min-h-screen gap-6 p-8"
  >
    <h1 class="text-2xl font-bold">Para Modal Example</h1>
    <p class="max-w-md text-center">
      This minimal example demonstrates how to integrate the Para Modal in a Vue
      project.
    </p>
    <WalletDisplay v-if="isConnected" :walletAddress="wallet" />
    <p v-else class="text-center">You are not logged in.</p>
    <button
      :disabled="isLoading"
      @click="openModal"
      class="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950"
    >
      Open Para Modal
    </button>
    <p v-if="error" class="text-red-500 text-sm text-center">
      {{ error }}
    </p>
    <div ref="reactRoot"></div>
  </main>
</template>

<script setup lang="ts">
import WalletDisplay from "./components/WalletDisplay.vue";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { para } from "./client/para";
import { AuthLayout, OAuthMethod } from "@getpara/react-sdk";
import { createElement } from "react";
import ReactDOM from "react-dom/client";
import { ReactComponent } from "./react-component.jsx";

const isOpen = ref(false);
const isConnected = ref(false);
const isLoading = ref(false);
const wallet = ref("");
const error = ref("");

const reactRoot = ref(null);
let root = null;

async function handleCheckIfAuthenticated() {
  isLoading.value = true;
  error.value = "";
  try {
    const isAuthenticated = await para.isFullyLoggedIn();
    isConnected.value = isAuthenticated;
    if (isAuthenticated) {
      const wallets = Object.values(await para.getWallets());
      if (wallets?.length) {
        wallet.value = wallets[0].address || "unknown";
      }
    }
  } catch (err: any) {
    error.value = err.message || "An error occurred during authentication";
  }
  isLoading.value = false;
}

async function handleClose() {
  await handleCheckIfAuthenticated();
  isOpen.value = false;
}

onMounted(async () => {
  await handleCheckIfAuthenticated();

  root = ReactDOM.createRoot(reactRoot.value);
  root.render(
    createElement(ReactComponent, {
      isOpen: false,
      onClose: handleClose,
    })
  );
});

watch(isOpen, (newIsOpen) => {
  if (root) {
    root.render(
      createElement(ReactComponent, {
        isOpen: newIsOpen,
        onClose: handleClose,
      })
    );
  }
});

onUnmounted(() => {
  root?.unmount();
});

function openModal() {
  isOpen.value = true;
}
</script>
