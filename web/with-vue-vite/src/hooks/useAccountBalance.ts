import { onScopeDispose, readonly, ref, toValue, watch, type MaybeRefOrGetter } from "vue";
import { para } from "@/lib/para";

export function useAccountBalance(walletId: MaybeRefOrGetter<string>) {
  const balance = ref<string | null>(null);
  const isLoading = ref(false);
  const isRefreshing = ref(false);

  async function readBalance(): Promise<string | null> {
    const id = toValue(walletId);
    const rpcUrl = para.config.rpcUrl;

    if (!id || !rpcUrl) {
      return null;
    }

    try {
      return (await para.getWalletBalance({ walletId: id, rpcUrl })) ?? null;
    } catch (error) {
      console.error("Failed to read the wallet balance:", error instanceof Error ? error.message : error);
      return null;
    }
  }

  async function load(): Promise<void> {
    isLoading.value = Boolean(toValue(walletId) && para.config.rpcUrl);
    balance.value = await readBalance();
    isLoading.value = false;
  }

  async function refresh(): Promise<void> {
    isRefreshing.value = true;
    balance.value = await readBalance();
    isRefreshing.value = false;
  }

  watch(() => toValue(walletId), load, { immediate: true });
  onScopeDispose(para.onConfigChange(() => void load()));

  return {
    balance: readonly(balance),
    isLoading: readonly(isLoading),
    isRefreshing: readonly(isRefreshing),
    refresh,
  };
}
