import type { BulkPregenServiceDependencies } from "@/lib/server/bulkPregenService";
import { createParaServerClient } from "@/lib/server/paraServerClient";
import { memoryPregenWalletStore } from "@/lib/server/pregenWalletStore";

export function getBulkPregenServiceDependencies(): BulkPregenServiceDependencies {
  return {
    createClient: createParaServerClient,
    store: memoryPregenWalletStore,
  };
}
