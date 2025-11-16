<template>
  <div class="space-y-4">
    <template v-if="state.step === 'select' || state.step === 'phone'">
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div class="flex gap-2">
          <select
            v-model="state.countryCode"
            :disabled="state.isLoading"
            class="px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option v-for="{ code, country } in countryCodes" :key="code" :value="code">
              {{ code }} {{ country }}
            </option>
          </select>
          
          <input
            id="phone"
            type="tel"
            v-model="state.phoneNumber"
            :disabled="state.isLoading"
            placeholder="123 456 7890"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>
      
      <AuthButton
        :is-loading="state.isLoading"
        :disabled="!state.phoneNumber || !state.countryCode"
        @click="handlePhoneSubmit"
      >
        Continue with Phone
      </AuthButton>
    </template>
    
    <template v-else-if="state.step === 'verify'">
      <div class="text-center space-y-4">
        <p class="text-sm text-gray-600">
          We sent a verification code to {{ formatPhoneDisplay(state.phoneNumber, state.countryCode) }}
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

const { state, signUpOrLoginWithPhone, verifyAccount, waitForLogin, waitForWalletCreation } = useParaAuth();

let popupWindow = ref<Window | null>(null);

const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+33', country: 'FR' },
  { code: '+49', country: 'DE' },
  { code: '+81', country: 'JP' },
  { code: '+86', country: 'CN' },
  { code: '+91', country: 'IN' },
];

function openPopup(url: string, name: string) {
  popupWindow.value?.close();
  popupWindow.value = window.open(url, name, 'popup=true');
}

async function handlePhoneSubmit() {
  if (!state.phoneNumber || !state.countryCode) return;
  
  try {
    const authState = await signUpOrLoginWithPhone(state.phoneNumber, state.countryCode);
    
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

function formatPhoneDisplay(phone: string, code: string): string {
  return `${code} ${phone}`;
}
</script>