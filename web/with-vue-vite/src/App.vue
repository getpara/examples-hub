<template>
  <main
    class="flex flex-col items-center justify-center min-h-screen gap-6 p-8"
  >
    <h1 class="text-2xl font-bold">Para Custom Auth Demo</h1>
    <p class="max-w-md text-center">
      Sign messages with your Para wallet using email, phone, or social authentication. 
      This demonstrates using Para's web-sdk with native Vue components and a unified authentication flow.
    </p>
    <WalletDisplay v-if="isConnected" :walletAddress="address" />
    <p v-else class="text-center">You are not logged in.</p>
    <button
      :disabled="isLoading"
      @click="openModal"
      class="rounded-none px-4 py-2 bg-gray-800 text-white hover:bg-gray-900"
    >
      Open Para Modal
    </button>
    <p v-if="error" class="text-gray-600 text-sm text-center">
      {{ error }}
    </p>
    
    <div v-if="isConnected" class="w-full max-w-md space-y-4">
      <form @submit.prevent="handleSignMessage" class="space-y-4">
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
            Message to Sign
          </label>
          <textarea
            id="message"
            v-model="message"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter your message here..."
          />
        </div>
        <button
          type="submit"
          :disabled="signingMessage || !message"
          class="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {{ signingMessage ? 'Signing...' : 'Sign Message' }}
        </button>
      </form>
      
      <div v-if="signature" class="p-4 bg-gray-50 border border-gray-200 rounded-none">
        <h3 class="text-sm font-medium text-gray-900 mb-2">Signature</h3>
        <p class="text-xs font-mono text-gray-700 break-all">{{ signature }}</p>
      </div>
      
      <div v-if="signError" class="p-4 bg-gray-100 border border-gray-300 rounded-none">
        <p class="text-sm text-gray-700">{{ signError }}</p>
      </div>
    </div>
  </main>
  
  <AuthModal />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import WalletDisplay from "./components/WalletDisplay.vue";
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