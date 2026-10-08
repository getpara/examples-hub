import type { Para } from "@getpara/server-sdk";
import { isHandleType, type GenerateWalletResponse, type HandleEntry } from "@/lib/pregenWalletApi";
import type { PregenWalletStore } from "@/lib/server/pregenWalletStore";

export class InvalidWalletRequestError extends Error {}

export interface GenerateWalletInput {
  handle?: string;
  type?: string;
}

export type PregenWalletClient = Pick<Para, "createPregenWallet" | "getUserShare">;

export interface BulkPregenServiceDependencies {
  createClient: () => PregenWalletClient;
  store: PregenWalletStore;
}

export async function generatePregenWalletForHandle(
  input: GenerateWalletInput,
  dependencies: BulkPregenServiceDependencies
): Promise<GenerateWalletResponse> {
  const entry = toHandleEntry(input);
  const para = dependencies.createClient();
  const wallet = await para.createPregenWallet({
    type: "EVM",
    pregenId: entry.type === "TWITTER" ? { xUsername: entry.handle } : { telegramUserId: entry.handle },
  });
  const userShare = para.getUserShare();

  if (!wallet?.id || !userShare) {
    throw new Error("Failed to generate the pregen wallet");
  }

  dependencies.store.save({
    handle: entry.handle,
    type: entry.type,
    walletId: wallet.id,
    walletAddress: wallet.address ?? null,
    userShare,
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    handle: entry.handle,
    wallet: { address: wallet.address },
  };
}

function toHandleEntry({ handle, type }: GenerateWalletInput): HandleEntry {
  const trimmedHandle = typeof handle === "string" ? handle.trim() : "";

  if (!trimmedHandle) {
    throw new InvalidWalletRequestError("A handle is required");
  }

  if (typeof type !== "string" || !isHandleType(type)) {
    throw new InvalidWalletRequestError("The type must be TWITTER or TELEGRAM");
  }

  return { handle: trimmedHandle, type };
}
