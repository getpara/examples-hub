<template>
  <Header :isConnected="isConnected" />
  
  <div class="container mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold tracking-tight mb-4">Para Custom Auth Demo</h1>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Sign messages with your Para wallet using email, phone, or social authentication. 
        This demonstrates using Para's web-sdk with native Vue components and a unified authentication flow.
      </p>
    </div>
    
    <div v-if="!isConnected" data-testid="not-logged-in">
      <div class="max-w-xl mx-auto text-center">
        <div class="bg-white rounded-none border border-gray-200 p-8">
          <h2 class="text-xl font-medium mb-4">Connect Your Wallet</h2>
          <p class="text-gray-600 mb-6">
            Connect your wallet to start signing messages and interacting with the application.
          </p>
          <button
            :disabled="isLoading"
            @click="openModal"
            class="px-6 py-3 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors font-medium"
            data-testid="open-modal-button"
          >
            Connect Wallet
          </button>
          <p v-if="error" class="text-red-600 text-sm mt-4">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
    
    <div v-else class="max-w-xl mx-auto" data-testid="wallet-connected">
      <div class="mb-8 rounded-none border border-gray-200">
        <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-900">Connected Wallet</h3>
        </div>
        <div class="px-6 py-3">
          <p class="text-sm text-gray-500">Address</p>
          <p class="text-lg font-medium text-gray-900 font-mono" data-testid="wallet-address">
            {{ address?.slice(0, 6) }}...{{ address?.slice(-4) }}
          </p>
        </div>
      </div>
      
      <form @submit.prevent="handleSignMessage" class="bg-white rounded-none border border-gray-200 p-6 mb-4" data-testid="sign-message-form">
        <h3 class="text-lg font-medium mb-4">Sign Message</h3>
        <div class="space-y-4">
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
              Message to sign
            </label>
            <textarea
              id="message"
              v-model="message"
              rows="4"
              data-testid="sign-message-input"
              class="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
              placeholder="Enter your message here..."
              :disabled="signingMessage"
            />
          </div>
          <button
            type="submit"
            :disabled="signingMessage || !message.trim()"
            class="w-full px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            data-testid="sign-message-button"
          >
            {{ signingMessage ? 'Signing...' : 'Sign Message' }}
          </button>
        </div>
      </form>
      
      <div v-if="signature" class="bg-white rounded-none border border-gray-200 p-6 mb-4">
        <h3 class="text-lg font-medium mb-2">Signature</h3>
        <div class="bg-gray-50 p-4 rounded-none border border-gray-200 break-all">
          <code class="text-sm text-gray-800 font-mono" data-testid="sign-signature-display">{{ signature }}</code>
        </div>
      </div>
      
      <div v-if="signError" class="bg-red-50 border border-red-200 p-4 rounded-none">
        <p class="text-sm text-red-700">{{ signError }}</p>
      </div>
    </div>
  </div>
  
  <AuthModal />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Header from "./components/layout/Header.vue";
import AuthModal from "./components/AuthModal.vue";
import { useParaAccount } from "@/composables/useParaAccount";
import { useParaAuth } from "@/composables/useParaAuth";

const { isConnected, address, isLoading, error, checkAuthentication, signMessage } = useParaAccount();
const { openModal } = useParaAuth();

const message = ref("Hello Para!");
const signingMessage = ref(false);
const signature = ref("");
const signError = ref("");

onMounted(async () => {
  await checkAuthentication();
});

async function handleSignMessage() {
  if (!isConnected.value || !message.value) return;
  
  signingMessage.value = true;
  signature.value = "";
  signError.value = "";
  
  try {
    const result = await signMessage(message.value);
    if (result && 'signature' in result) {
      signature.value = result.signature;
    }
  } catch (err: any) {
    signError.value = err.message || "Failed to sign message";
  } finally {
    signingMessage.value = false;
  }
}
</script>