<script lang="ts">
  import { onMount } from "svelte";
  import { isConnected, checkAuthentication } from "@/stores/account";
  import Header from "@/components/layout/Header.svelte";
  import CombinedAuth from "@/components/ui/CombinedAuth.svelte";
  import WalletInfo from "@/components/ui/WalletInfo.svelte";
  import SignMessage from "@/components/ui/SignMessage.svelte";

  onMount(() => {
    checkAuthentication();
  });
</script>

<Header />

<div class="container mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold tracking-tight mb-4">
      Para Custom Auth Demo
    </h1>
    <p class="text-lg text-gray-600 max-w-3xl mx-auto">
      Sign messages with your Para wallet using email, phone, or social
      authentication. This demonstrates using Para's web-sdk with native Svelte
      components and a unified authentication flow.
    </p>
  </div>

  {#if !$isConnected}
    <div data-testid="not-logged-in">
      <CombinedAuth />
    </div>
  {:else}
    <div class="max-w-xl mx-auto" data-testid="wallet-connected">
      <WalletInfo />
      <SignMessage />
    </div>
  {/if}
</div>
