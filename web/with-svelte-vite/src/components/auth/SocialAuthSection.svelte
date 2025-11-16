<script lang="ts">
  import { authModal, verifyOAuth, waitForLogin, waitForWalletCreation } from '@/stores/paraAuth';
  import AuthButton from './AuthButton.svelte';
  import type { TOAuthMethod } from '@getpara/web-sdk';
  
  let popupWindow: Window | null = null;
  
  $: ({ selectedOAuthMethod, isLoading, error } = $authModal);
  
  interface OAuthOption {
    method: TOAuthMethod;
    label: string;
    icon: string;
  }
  
  const oAuthOptions: OAuthOption[] = [
    {
      method: 'GOOGLE',
      label: 'Continue with Google',
      icon: '/google.svg',
    },
    {
      method: 'TWITTER',
      label: 'Continue with Twitter', 
      icon: '/twitter.svg',
    },
    {
      method: 'APPLE',
      label: 'Continue with Apple',
      icon: '/apple.svg',
    },
    {
      method: 'DISCORD',
      label: 'Continue with Discord',
      icon: '/discord.svg',
    },
    {
      method: 'FACEBOOK',
      label: 'Continue with Facebook',
      icon: '/facebook.svg',
    },
    {
      method: 'FARCASTER',
      label: 'Continue with Farcaster',
      icon: '/farcaster.svg',
    },
  ];
  
  function openPopup(url: string, name: string) {
    popupWindow?.close();
    popupWindow = window.open(url, name, 'popup=true');
  }
  
  async function handleOAuthAuthentication(method: TOAuthMethod) {
    if (method === 'TELEGRAM') {
      authModal.update(state => ({
        ...state,
        error: 'Telegram authentication is not supported in this example.',
      }));
      return;
    }
    
    try {
      const authState = await verifyOAuth(
        method,
        (url) => openPopup(url, method === 'FARCASTER' ? 'farcasterConnectPopup' : 'oAuthPopup'),
        () => Boolean(popupWindow?.closed)
      );
      
      if (authState.stage === 'signup' && 'passkeyUrl' in authState && authState.passkeyUrl) {
        openPopup(authState.passkeyUrl, 'signUpPopup');
        await waitForWalletCreation(() => Boolean(popupWindow?.closed));
      } else if (authState.stage === 'login' && 'passkeyUrl' in authState && authState.passkeyUrl) {
        openPopup(authState.passkeyUrl, 'loginPopup');
        await waitForLogin(() => Boolean(popupWindow?.closed));
      }
    } catch {
      // Error handled in store
    }
  }
</script>

<div class="space-y-4">
  <div class="grid grid-cols-2 gap-3">
    {#each oAuthOptions as { method, label, icon }}
      {@const isCurrentlyAuthenticating = selectedOAuthMethod === method}
      <AuthButton
        variant="secondary"
        isLoading={isCurrentlyAuthenticating}
        disabled={isLoading}
        onClick={() => handleOAuthAuthentication(method)}
        loadingText="Authenticating..."
        data-testid={`social-auth-${method.toLowerCase()}`}
      >
        <span class="flex items-center justify-center gap-2">
          <img
            src={icon}
            alt=""
            class="w-4 h-4"
            aria-hidden="true"
          />
          <span class="text-sm">{label.replace('Continue with ', '')}</span>
        </span>
      </AuthButton>
    {/each}
  </div>
  
  {#if error}
    <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-none">
      {error}
    </div>
  {/if}
</div>