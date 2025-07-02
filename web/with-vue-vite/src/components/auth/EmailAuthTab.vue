<template>
  <div class="space-y-4">
    <template v-if="state.step === 'select' || state.step === 'email'">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          v-model="state.email"
          :disabled="state.isLoading"
          placeholder="you@example.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          data-testid="email-input"
        />
      </div>
      
      <AuthButton
        :is-loading="state.isLoading"
        :disabled="!state.email"
        @click="handleEmailSubmit"
        data-testid="continue-email-button"
      >
        Continue with Email
      </AuthButton>
    </template>
    
    <template v-else-if="state.step === 'verify'">
      <div class="text-center space-y-4">
        <p class="text-sm text-gray-600">
          We sent a verification code to {{ state.email }}
        </p>
        
        <OTPInput
          v-model="state.verificationCode"
          :disabled="state.isLoading"
        />
        
        <AuthButton
          :is-loading="state.isLoading"
          :disabled="!state.verificationCode || state.verificationCode.length !== 6"
          @click="handleVerification"
          loading-text="Verifying..."
          data-testid="verify-wallet-button"
        >
          Verify & Create Wallet
        </AuthButton>
      </div>
    </template>
    
    <template v-else-if="state.step === 'login'">
      <div class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p class="text-gray-600">Completing login...</p>
      </div>
    </template>
    
    <div v-if="state.error" class="p-3 bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-none">
      {{ state.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useParaAuth } from '@/composables/useParaAuth';
import AuthButton from './AuthButton.vue';
import OTPInput from './OTPInput.vue';

const { state, signUpOrLoginWithEmail, verifyAccount, waitForLogin, waitForWalletCreation } = useParaAuth();

let popupWindow = ref<Window | null>(null);

function openPopup(url: string, name: string) {
  popupWindow.value?.close();
  popupWindow.value = window.open(url, name, 'popup=true');
}

async function handleEmailSubmit() {
  if (!state.email) return;
  
  try {
    const authState = await signUpOrLoginWithEmail(state.email);
    
    if (authState.stage === 'login' && 'passkeyUrl' in authState && authState.passkeyUrl) {
      openPopup(authState.passkeyUrl, 'loginPopup');
      await waitForLogin(() => popupWindow.value?.closed ?? true);
    }
  } catch {
    // Error handled in composable
  }
}

async function handleVerification() {
  if (!state.verificationCode) return;
  
  try {
    const authState = await verifyAccount(state.verificationCode);
    
    if ('passkeyUrl' in authState && authState.passkeyUrl) {
      openPopup(authState.passkeyUrl, 'signUpPopup');
      await waitForWalletCreation(() => Boolean(popupWindow.value?.closed));
    }
  } catch {
    // Error handled in composable
  }
}
</script>