import { ref, computed } from "vue";
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

const state = ref<AccountState>({
  isConnected: false,
  address: "",
  walletId: "",
  isLoading: false,
  error: null,
});

export async function checkAuthentication(): Promise<void> {
  state.value = { ...state.value, isLoading: true, error: null };

  try {
    const isAuthenticated = await para.isFullyLoggedIn();

    if (isAuthenticated) {
      const wallets = Object.values(await para.getWallets());
      const firstWallet = wallets?.[0];

      state.value = {
        ...state.value,
        isConnected: true,
        address: firstWallet?.address || "",
        walletId: firstWallet?.id || "",
        isLoading: false,
      };
    } else {
      state.value = {
        ...state.value,
        isConnected: false,
        address: "",
        walletId: "",
        isLoading: false,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to check authentication";
    state.value = {
      ...state.value,
      isConnected: false,
      address: "",
      walletId: "",
      isLoading: false,
      error: errorMessage,
    };
  }
}

export async function signMessage(message: string): Promise<string> {
  if (!state.value.isConnected) {
    throw new Error("Not connected");
  }

  if (!state.value.address) {
    throw new Error("No wallet found");
  }

  const walletClient = createParaViemClient({ para, walletClientConfig: {
    chain: sepolia,
    transport: http(),
  } });

  const signature = await walletClient.signMessage({ message });
  return signature;
}

export async function logout(): Promise<void> {
  try {
    await para.logout();
    state.value = {
      isConnected: false,
      address: "",
      walletId: "",
      isLoading: false,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to logout";
    state.value = {
      ...state.value,
      error: errorMessage,
    };
    throw error;
  }
}

export function useAccount() {
  const isConnected = computed(() => state.value.isConnected);
  const address = computed(() => state.value.address);
  const walletId = computed(() => state.value.walletId);
  const isLoading = computed(() => state.value.isLoading);
  const error = computed(() => state.value.error);

  return {
    isConnected,
    address,
    walletId,
    isLoading,
    error,
    checkAuthentication,
    signMessage,
    logout,
  };
}
