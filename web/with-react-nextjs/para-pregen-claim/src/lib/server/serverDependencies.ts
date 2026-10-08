import { randomUUID } from "node:crypto";
import { decrypt, encrypt } from "@/lib/server/encryption";
import { pregenWalletStore } from "@/lib/server/keySharesDB";
import { createParaServerClient } from "@/lib/server/paraServerClient";
import type { PregenClaimServiceDependencies } from "@/lib/server/pregenClaimService";

export function getPregenClaimServiceDependencies(): PregenClaimServiceDependencies {
  return {
    para: createParaServerClient(),
    store: pregenWalletStore,
    encrypt,
    decrypt,
    generateCustomId: randomUUID,
  };
}
