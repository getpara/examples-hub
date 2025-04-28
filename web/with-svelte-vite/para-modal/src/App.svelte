<script lang="ts">
  import { onMount } from 'svelte';
  import { para } from './client/para';
  import "@getpara/react-sdk/styles.css";
  import { AuthLayout, ParaProvider } from "@getpara/react-sdk";
  import { sveltify } from "svelte-preprocess-react";
  import WalletDisplay from "./lib/WalletDisplay.svelte";
  import { QueryClientProvider } from "@tanstack/react-query";
  import { queryClient } from './client/queryClient';

  const react = sveltify({ ParaProvider, QueryClientProvider });

  let isOpen = false;
  let isConnected = false;
  let isLoading = false;
  let wallet = "";
  let error = "";

  async function handleCheckIfAuthenticated() {
    isLoading = true;
    error = "";
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      isConnected = isAuthenticated;
      if (isAuthenticated) {
        const wallets = Object.values(await para.getWallets());
        if (wallets?.length) {
          wallet = wallets[0].address || "unknown";
        }
      }
    } catch (err: any) {
      error = err.message || "An error occurred during authentication";
    }
    isLoading = false;
  }

  function openModal() {
    isOpen = true;
  }

  async function closeModal() {
    await handleCheckIfAuthenticated();
    isOpen = false;
  }

  onMount(() => {
    handleCheckIfAuthenticated();
  });
</script>

<main class="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
  <h1 class="text-2xl font-bold">Para Modal Example</h1>
  <p class="max-w-md text-center">
    This minimal example demonstrates how to integrate the Para Modal in a Svelte project.
  </p>

  {#if isConnected}
    <WalletDisplay walletAddress={wallet} />
  {:else}
    <p class="text-center">You are not logged in.</p>
  {/if}

  <button
    class="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950"
    on:click={openModal}
    disabled={isLoading}
  >
    Open Para Modal
  </button>

  {#if error}
    <p class="text-red-500 text-sm text-center">{error}</p>
  {/if}

  <react.QueryClientProvider client={queryClient}>
    <react.ParaProvider
      paraClientConfig={para}
      config={{appName: "Para Modal Example"}}
      paraModalConfig={{
        isOpen,
        onClose: closeModal,
        logo: "/para.svg",
        disableEmailLogin: false,
        disablePhoneLogin: false,
        authLayout: [AuthLayout.AUTH_FULL],
        oAuthMethods: [
          "APPLE",
          "DISCORD",
          "FACEBOOK",
          "FARCASTER",
          "GOOGLE",
          "TWITTER",
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
      }}
      externalWalletConfig={{
        wallets: []
      }}
    />
  </react.QueryClientProvider>
  
</main>
