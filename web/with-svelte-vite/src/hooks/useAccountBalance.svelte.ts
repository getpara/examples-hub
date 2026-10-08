import { para } from "@/lib/para";

export function useAccountBalance(getWalletId: () => string) {
  let balance = $state<string | null>(null);
  let isLoading = $state(false);
  let isRefreshing = $state(false);

  async function readBalance(walletId: string): Promise<string | null> {
    const rpcUrl = para.config.rpcUrl;

    if (!walletId || !rpcUrl) {
      return null;
    }

    try {
      return (await para.getWalletBalance({ walletId, rpcUrl })) ?? null;
    } catch (error) {
      console.error("Failed to read the wallet balance:", error instanceof Error ? error.message : error);
      return null;
    }
  }

  async function load(walletId: string) {
    isLoading = Boolean(walletId && para.config.rpcUrl);
    balance = await readBalance(walletId);
    isLoading = false;
  }

  async function refresh() {
    isRefreshing = true;
    balance = await readBalance(getWalletId());
    isRefreshing = false;
  }

  $effect(() => {
    void load(getWalletId());
  });

  $effect(() => para.onConfigChange(() => void load(getWalletId())));

  return {
    get balance() {
      return balance;
    },
    get isLoading() {
      return isLoading;
    },
    get isRefreshing() {
      return isRefreshing;
    },
    refresh,
  };
}
