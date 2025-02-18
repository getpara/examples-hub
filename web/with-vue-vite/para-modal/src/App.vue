<template>
  <main class="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
    <h1 class="text-2xl font-bold">Para Modal Example</h1>
    <p class="max-w-md text-center">
      This minimal example demonstrates how to integrate the Para Modal in a Vue project.
    </p>
    <WalletDisplay
      v-if="isConnected"
      :walletAddress="wallet" />
    <p
      v-else
      class="text-center">
      You are not logged in.
    </p>
    <button
      :disabled="isLoading"
      @click="openModal"
      class="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
      Open Para Modal
    </button>
    <p
      v-if="error"
      class="text-red-500 text-sm text-center">
      {{ error }}
    </p>
  </main>
</template>

<script setup lang="ts">
  import WalletDisplay from "./components/WalletDisplay.vue";
  import { ref, onMounted, onUnmounted } from "vue";
  import { para } from "./client/para";
  import { createParaModalConnector } from "./para-modal-connector";
  import { AuthLayout, OAuthMethod } from "@getpara/react-sdk";

  const isOpen = ref(false);
  const isConnected = ref(false);
  const isLoading = ref(false);
  const wallet = ref("");
  const error = ref("");

  let modalConnector: ReturnType<typeof createParaModalConnector> | null = null;

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

  onMounted(async () => {
    await handleCheckIfAuthenticated();

    const container = document.createElement("div");
    document.body.appendChild(container);

    modalConnector = createParaModalConnector(container, {
      para,
      appName: "Para Modal Example",
      logo: "/para.svg",
      disableEmailLogin: false,
      disablePhoneLogin: false,
      authLayout: [AuthLayout.AUTH_FULL],
      oAuthMethods: [
        OAuthMethod.APPLE,
        OAuthMethod.DISCORD,
        OAuthMethod.FACEBOOK,
        OAuthMethod.FARCASTER,
        OAuthMethod.GOOGLE,
        OAuthMethod.TWITTER,
      ],
      onRampTestMode: true,
      recoverySecretStepEnabled: true,
      twoFactorAuthEnabled: false,
      theme: {
        foregroundColor: "#2D3648",
        backgroundColor: "#FFFFFF",
        accentColor: "#0066CC",
        darkForegroundColor: "#E8EBF2",
        darkBackgroundColor: "#1A1F2B",
        darkAccentColor: "#4D9FFF",
        mode: "light",
        borderRadius: "none",
        font: "Inter",
      },
      onClose: async () => {
        await handleCheckIfAuthenticated();
        modalConnector?.close();
        isOpen.value = false;
      },
    });
  });

  onUnmounted(() => {
    modalConnector?.unmount();
  });

  function openModal() {
    isOpen.value = true;
    modalConnector?.open();
  }
</script>
