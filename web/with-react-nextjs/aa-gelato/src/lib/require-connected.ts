import type { ParaWeb as Para } from "@getpara/react-sdk";

/**
 * Utility function that validates connection requirements.
 * Throws an error if not connected.
 */
export function requireConnected(para: Para | undefined, walletId: string | undefined, isConnected: boolean) {
  if (!para || !walletId || !isConnected) {
    throw new Error("Not connected");
  }

  return { para, walletId };
}