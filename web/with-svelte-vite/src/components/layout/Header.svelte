<script lang="ts">
  import { isConnected, address, logout } from "@/stores/account";

  async function handleDisconnect() {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }

  function formatAddress(addr: string): string {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
        {#if $isConnected}
          <div class="flex items-center gap-4">
            <span
              class="text-sm text-gray-600 font-mono"
              data-testid="account-address-display"
            >
              {formatAddress($address)}
            </span>
            <button
              onclick={handleDisconnect}
              class="px-4 py-2 bg-gray-900 text-white hover:bg-gray-950 transition-colors text-sm font-medium"
              data-testid="header-disconnect-button"
            >
              Disconnect
            </button>
          </div>
        {/if}
      </nav>
    </div>
  </div>
</header>
