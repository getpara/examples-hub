import { ref, computed } from 'vue';
import { para } from '@/lib/para/client';

const isConnected = ref(false);
const address = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useParaAccount() {
  async function checkAuthentication() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      
      if (isAuthenticated) {
        const wallets = Object.values(await para.getWallets());
        address.value = wallets?.[0]?.address || '';
        isConnected.value = true;
      } else {
        isConnected.value = false;
        address.value = '';
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to check authentication';
      isConnected.value = false;
      address.value = '';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function signMessage(message: string): Promise<any> {
    if (!isConnected.value) {
      throw new Error('Not connected');
    }
    
    const wallets = Object.values(await para.getWallets());
    if (!wallets?.length) {
      throw new Error('No wallet found');
    }
    
    return await para.signMessage({
      walletId: wallets[0].id,
      messageBase64: btoa(message),
    });
  }
  
  return {
    isConnected: computed(() => isConnected.value),
    address: computed(() => address.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    checkAuthentication,
    signMessage,
  };
}