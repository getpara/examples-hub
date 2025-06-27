<script lang="ts">
  export let isConnected: boolean = false;
  export let openModal: () => void;

  function handleDisconnect() {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }
</script>

<header class="bg-white border-b border-gray-200">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center space-x-2">
        <img src="/para.svg" alt="Para Logo" class="w-8 h-8" />
        <span class="font-semibold text-lg">Para SDK</span>
      </div>

      <nav>
        {#if isConnected}
          <button
            on:click={handleDisconnect}
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Disconnect
          </button>
        {:else}
          <button
            on:click={openModal}
            class="px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors text-sm font-medium">
            Connect Wallet
          </button>
        {/if}
      </nav>
    </div>
  </div>
</header>