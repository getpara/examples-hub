<script lang="ts">
  import { signMessage } from "@/stores/account";

  const MESSAGE = "Hello World!";

  let isPending = $state(false);
  let signature = $state<string | null>(null);
  let error = $state<string | null>(null);

  async function handleSign() {
    if (isPending) return;

    isPending = true;
    error = null;

    try {
      signature = await signMessage(MESSAGE);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to sign message";
      signature = null;
    } finally {
      isPending = false;
    }
  }
</script>

{#if error}
  <div class="mb-4 p-4 border border-gray-400 bg-gray-200">
    <p class="text-sm text-gray-900">{error}</p>
  </div>
{/if}

{#if isPending}
  <div class="mb-4 p-4 border border-gray-300 bg-gray-100">
    <p class="text-sm text-gray-700">Signing '{MESSAGE}'...</p>
  </div>
{/if}

{#if signature && !isPending}
  <div class="mb-4 p-4 border border-gray-200 bg-gray-50">
    <p class="text-sm text-gray-800">'{MESSAGE}' signed successfully!</p>
  </div>
{/if}

<div class="bg-white border border-gray-200 p-6 mb-4">
  <h3 class="text-lg font-medium mb-4">Sign Message</h3>
  <div class="space-y-4">
    <div class="p-4 bg-gray-50 border border-gray-200">
      <p class="text-sm text-gray-600 mb-1">Message to sign:</p>
      <p class="text-lg font-mono font-semibold">{MESSAGE}</p>
    </div>
    <button
      type="button"
      onclick={handleSign}
      disabled={isPending}
      data-testid="sign-message-button"
      class="w-full px-4 py-2 bg-gray-900 text-white hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
    >
      {isPending ? "Signing..." : `Sign ${MESSAGE}`}
    </button>
  </div>
</div>

{#if signature}
  <div class="bg-white border border-gray-200 p-6">
    <h3 class="text-lg font-medium mb-2">Signature</h3>
    <div
      class="bg-gray-50 p-4 border border-gray-200 break-all"
      data-testid="sign-signature-display"
    >
      <code class="text-sm text-gray-800 font-mono">{signature}</code>
    </div>
  </div>
{/if}
