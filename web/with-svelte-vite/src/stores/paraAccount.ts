import { writable, derived, get } from 'svelte/store';
import { para } from '@/lib/para/client';

interface AccountState {
  isConnected: boolean;
  address: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  isConnected: false,
  address: '',
  isLoading: false,
  error: null,
};

export const accountState = writable<AccountState>(initialState);

// Derived stores for easier access
export const isConnected = derived(accountState, $state => $state.isConnected);
export const address = derived(accountState, $state => $state.address);
export const isLoading = derived(accountState, $state => $state.isLoading);

// Check authentication status
export async function checkAuthentication() {
  accountState.update(state => ({ ...state, isLoading: true, error: null }));
  
  try {
    const isAuthenticated = await para.isFullyLoggedIn();
    
    if (isAuthenticated) {
      const wallets = Object.values(await para.getWallets());
      const address = wallets?.[0]?.address || '';
      
      accountState.update(state => ({
        ...state,
        isConnected: true,
        address,
        isLoading: false,
      }));
    } else {
      accountState.update(state => ({
        ...state,
        isConnected: false,
        address: '',
        isLoading: false,
      }));
    }
  } catch (error: any) {
    accountState.update(state => ({
      ...state,
      isConnected: false,
      address: '',
      isLoading: false,
      error: error.message || 'Failed to check authentication',
    }));
  }
}

// Sign message
export async function signMessage(message: string): Promise<any> {
  const currentState = get(accountState);
  
  if (!currentState.isConnected) {
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