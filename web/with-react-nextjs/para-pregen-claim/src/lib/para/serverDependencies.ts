import { randomUUID } from "node:crypto";
import { decrypt, encrypt } from "@/lib/db/encryption";
import { pregenWalletStore } from "@/lib/db/keySharesDB";
import { getParaClient } from "@/lib/para/client";
import type { PregenClaimServiceDependencies, PregenWalletClient } from "@/lib/para/pregenClaimService";

export function getPregenClaimServiceDependencies(): PregenClaimServiceDependencies {
  return {
    para: getParaClient() as unknown as PregenWalletClient,
    store: pregenWalletStore,
    encrypt,
    decrypt,
    generateCustomId: randomUUID,
  };
}
