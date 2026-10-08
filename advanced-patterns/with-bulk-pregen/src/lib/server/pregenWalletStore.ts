import type { HandleType } from "@/lib/pregenWalletApi";

export interface StoredPregenWallet {
  handle: string;
  type: HandleType;
  walletId: string;
  walletAddress: string | null;
  userShare: string;
  createdAt: string;
}

export interface PregenWalletStore {
  save: (wallet: StoredPregenWallet) => void;
}

const wallets = new Map<string, StoredPregenWallet>();

function getWalletKey(handle: string, type: HandleType) {
  return `${type}:${handle}`;
}

export const memoryPregenWalletStore: PregenWalletStore = {
  save: (wallet) => {
    wallets.set(getWalletKey(wallet.handle, wallet.type), wallet);
  },
};
