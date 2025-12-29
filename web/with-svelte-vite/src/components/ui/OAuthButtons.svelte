<script lang="ts">
  import { authenticate, oauthAuthStore } from "@/stores/auth/oauthAuth";
  import { OAUTH_PROVIDERS } from "@/constants/auth";
  import type { TOAuthMethod } from "@getpara/web-sdk";

  interface Props {
    isPending: boolean;
  }

  let { isPending }: Props = $props();

  function handleClick(method: TOAuthMethod) {
    if (isPending) return;
    authenticate(method);
  }
</script>

<div class="space-y-3">
  <p class="text-sm text-gray-600 text-center mb-4">
    Sign in with your social account
  </p>

  <div class="grid grid-cols-2 gap-3">
    {#each OAUTH_PROVIDERS as provider}
      <button
        type="button"
        onclick={() => handleClick(provider.method)}
        disabled={isPending}
        class="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors {isPending && $oauthAuthStore.provider === provider.method
          ? 'bg-gray-100'
          : ''}"
      >
        <img src={provider.icon} alt={provider.label} class="w-5 h-5" />
        <span>{provider.label}</span>
      </button>
    {/each}
  </div>

  {#if isPending}
    <p class="text-sm text-gray-500 text-center mt-4">
      Complete authentication in the popup window...
    </p>
  {/if}
</div>
