<script lang="ts">
  import { onMount } from "svelte";
  import { isConnected, address, checkAuthentication, signMessage } from "@/stores/paraAccount";
  import { openModal } from "@/stores/paraAuth";
  import AuthModal from "@/components/AuthModal.svelte";
  import StatusAlert from "@/components/ui/StatusAlert.svelte";
  import ConnectWalletCard from "@/components/ui/ConnectWalletCard.svelte";
  import SignMessageForm from "@/components/ui/SignMessageForm.svelte";
  import SignatureDisplay from "@/components/ui/SignatureDisplay.svelte";
  import Header from "@/components/layout/Header.svelte";
  
  let message = "Hello Para!";
  let isLoading = false;
  let signature = "";
  let error = "";
  
  $: status = {
    show: isLoading || !!error || !!signature,
    type: isLoading ? "info" as const : error ? "error" as const : "success" as const,
    message: isLoading
      ? "Signing message..."
      : error
      ? error || "Failed to sign message. Please try again."
      : "Message signed successfully!",
  };
  
  onMount(() => {
    checkAuthentication();
  });
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!$isConnected) {
      return;
    }
    
    isLoading = true;
    error = "";
    signature = "";
    
    try {
      const result = await signMessage(message);
      if (result && 'signature' in result) {
        signature = result.signature;
      }
    } catch (err: any) {
      error = err.message || "Failed to sign message. Please try again.";
    } finally {
      isLoading = false;
    }
  }
  
  function handleMessageChange(value: string) {
    message = value;
    signature = "";
    error = "";
  }
</script>

<Header isConnected={$isConnected} {openModal} />

<div class="container mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold tracking-tight mb-4">Para Custom Auth Demo</h1>
    <p class="text-lg text-gray-600 max-w-3xl mx-auto">
      Sign messages with your Para wallet using email, phone, or social authentication. 
      This demonstrates using Para's web-sdk with native Svelte components and a unified authentication flow.
    </p>
  </div>
  
  {#if !$isConnected}
    <ConnectWalletCard onConnect={openModal} />
  {:else}
    <div class="max-w-xl mx-auto">
      <div class="mb-8 rounded-none border border-gray-200">
        <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-900">Connected Wallet</h3>
        </div>
        <div class="px-6 py-3">
          <p class="text-sm text-gray-500">Address</p>
          <p class="text-lg font-medium text-gray-900 font-mono">
            {$address?.slice(0, 6)}...{$address?.slice(-4)}
          </p>
        </div>
      </div>
      
      <StatusAlert
        show={status.show}
        type={status.type}
        message={status.message}
      />
      
      <SignMessageForm
        {message}
        {isLoading}
        onMessageChange={handleMessageChange}
        onSubmit={handleSubmit}
      />
      
      {#if signature}
        <SignatureDisplay {signature} />
      {/if}
    </div>
  {/if}
</div>

<AuthModal />