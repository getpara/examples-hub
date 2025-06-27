<template>
  <div class="grid grid-cols-2 gap-3">
    <AuthButton
      v-for="{ method, label, icon } in oAuthOptions"
      :key="method"
      variant="secondary"
      :is-loading="state.selectedOAuthMethod === method"
      :disabled="state.isLoading"
      @click="handleOAuthAuthentication(method)"
      loading-text="Authenticating..."
    >
      <span class="flex items-center justify-center gap-2">
        <img
          :src="icon"
          alt=""
          class="w-5 h-5"
          aria-hidden="true"
        />
        <span class="text-sm">{{ label.replace('Continue with ', '') }}</span>
      </span>
    </AuthButton>
    
    <div v-if="state.error" class="p-3 bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-none">
      {{ state.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useParaAuth } from '@/composables/useParaAuth';
import AuthButton from './AuthButton.vue';
import type { TOAuthMethod } from '@getpara/web-sdk';

const { state, verifyOAuth, waitForLogin, waitForWalletCreation } = useParaAuth();

let popupWindow = ref<Window | null>(null);

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
  popupWindow.value?.close();
  popupWindow.value = window.open(url, name, 'popup=true');
}

async function handleOAuthAuthentication(method: TOAuthMethod) {
  if (method === 'TELEGRAM') {
    state.error = 'Telegram authentication is not supported in this example.';
    return;
  }
  
  try {
    const authState = await verifyOAuth(
      method,
      (url) => openPopup(url, method === 'FARCASTER' ? 'farcasterConnectPopup' : 'oAuthPopup'),
      () => Boolean(popupWindow.value?.closed)
    );
    
    if (authState.stage === 'signup' && 'passkeyUrl' in authState && authState.passkeyUrl) {
      openPopup(authState.passkeyUrl, 'signUpPopup');
      await waitForWalletCreation(() => Boolean(popupWindow.value?.closed));
    } else if (authState.stage === 'login' && 'passkeyUrl' in authState && authState.passkeyUrl) {
      openPopup(authState.passkeyUrl, 'loginPopup');
      await waitForLogin(() => Boolean(popupWindow.value?.closed));
    }
  } catch {
    // Error handled in composable
  }
}
</script>