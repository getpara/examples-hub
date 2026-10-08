import { onMounted, readonly, ref } from "vue";
import { para } from "@/lib/para";

const isConnected = ref(false);
const address = ref("");
const walletId = ref("");
const isDisconnecting = ref(false);

function clearSession() {
  isConnected.value = false;
  address.value = "";
  walletId.value = "";
}

export async function refreshSession(): Promise<void> {
  try {
    if (!(await para.isFullyLoggedIn())) {
      clearSession();
      return;
    }

    const [wallet] = Object.values(await para.getWallets());
    address.value = wallet?.address ?? "";
    walletId.value = wallet?.id ?? "";
    isConnected.value = true;
  } catch {
    clearSession();
  }
}

async function disconnect(): Promise<void> {
  isDisconnecting.value = true;

  try {
    await para.logout();
    clearSession();
  } catch (error) {
    console.error("Failed to log out:", error instanceof Error ? error.message : error);
  } finally {
    isDisconnecting.value = false;
  }
}

export function useParaSession() {
  onMounted(() => {
    void refreshSession();
  });

  return {
    isConnected: readonly(isConnected),
    address: readonly(address),
    walletId: readonly(walletId),
    isDisconnecting: readonly(isDisconnecting),
    disconnect,
  };
}
