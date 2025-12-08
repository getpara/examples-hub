import { Wallet } from "@getpara/react-sdk";

declare global {
  var _walletStore: WalletStore | undefined;
}
// Note this is just for demo purposes and should not be used in production. We're using a global variable to store the wallet data so that we can access it across different API routes. In a real-world application, you would store this data in a database or some other persistent storage.
class WalletStore {
  private wallets: Map<string, { walletData: Wallet; userShare: string; createdAt: string }>;

  constructor() {
    this.wallets = new Map();
  }

  storeWallet(uuid: string, walletData: Wallet, userShare: string) {
    this.wallets.set(uuid, {
      walletData,
      userShare,
      createdAt: new Date().toISOString(),
    });
    return uuid;
  }

  getWallet(uuid: string) {
    return this.wallets.get(uuid);
  }

  getUserShare(uuid: string) {
    const wallet = this.wallets.get(uuid);
    return wallet ? wallet.userShare : null;
  }

  clearAll() {
    this.wallets.clear();
  }
}

const globalForWalletStore = global as unknown as { _walletStore: WalletStore };
export const walletStore = globalForWalletStore._walletStore || (globalForWalletStore._walletStore = new WalletStore());
