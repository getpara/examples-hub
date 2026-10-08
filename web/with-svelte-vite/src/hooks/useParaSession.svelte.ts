import { para } from "@/lib/para";

export function useParaSession() {
  let isConnected = $state(false);
  let address = $state("");
  let walletId = $state("");
  let isDisconnecting = $state(false);

  function clear() {
    isConnected = false;
    address = "";
    walletId = "";
  }

  async function refresh() {
    try {
      if (await para.isFullyLoggedIn()) {
        const [wallet] = Object.values(para.getWallets());
        isConnected = true;
        address = wallet?.address ?? "";
        walletId = wallet?.id ?? "";
      } else {
        clear();
      }
    } catch {
      clear();
    }
  }

  async function disconnect() {
    isDisconnecting = true;

    try {
      await para.logout();
      clear();
    } catch (error) {
      console.error("Failed to log out:", error instanceof Error ? error.message : error);
    } finally {
      isDisconnecting = false;
    }
  }

  return {
    get isConnected() {
      return isConnected;
    },
    get address() {
      return address;
    },
    get walletId() {
      return walletId;
    },
    get isDisconnecting() {
      return isDisconnecting;
    },
    refresh,
    disconnect,
  };
}
