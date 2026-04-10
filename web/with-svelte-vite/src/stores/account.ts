import { writable, derived, get } from "svelte/store";
import { para } from "@/lib/para";
import { createParaViemClient } from "@getpara/viem-v2-integration";
import { http } from "viem";
import { sepolia } from "viem/chains";

interface AccountState {
  isConnected: boolean;
  address: string;
  walletId: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  isConnected: false,
  address: "",
  walletId: "",
  isLoading: false,
  error: null,
};

export const accountState = writable<AccountState>(initialState);

// Derived stores for easier access
export const isConnected = derived(accountState, ($state) => $state.isConnected);
export const address = derived(accountState, ($state) => $state.address);
export const walletId = derived(accountState, ($state) => $state.walletId);
export const isLoading = derived(accountState, ($state) => $state.isLoading);

// Check authentication status
export async function checkAuthentication(): Promise<void> {
  accountState.update((state) => ({ ...state, isLoading: true, error: null }));

  try {
    const isAuthenticated = await para.isFullyLoggedIn();

    if (isAuthenticated) {
      const wallets = Object.values(await para.getWallets());
      const firstWallet = wallets?.[0];

      accountState.update((state) => ({
        ...state,
        isConnected: true,
        address: firstWallet?.address || "",
        walletId: firstWallet?.id || "",
        isLoading: false,
      }));
    } else {
      accountState.update((state) => ({
        ...state,
        isConnected: false,
        address: "",
        walletId: "",
        isLoading: false,
      }));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to check authentication";
    accountState.update((state) => ({
      ...state,
      isConnected: false,
      address: "",
      walletId: "",
      isLoading: false,
      error: errorMessage,
    }));
  }
}

// Sign message
export async function signMessage(message: string): Promise<string> {
  const currentState = get(accountState);

  if (!currentState.isConnected) {
    throw new Error("Not connected");
  }

  if (!currentState.address) {
    throw new Error("No wallet found");
  }

  const walletClient = createParaViemClient({ para, walletClientConfig: {
    chain: sepolia,
    transport: http(),
  } });

  const signature = await walletClient.signMessage({ message });
  return signature;
}

// Logout
export async function logout(): Promise<void> {
  try {
    await para.logout();
    accountState.set(initialState);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to logout";
    accountState.update((state) => ({
      ...state,
      error: errorMessage,
    }));
    throw error;
  }
}
