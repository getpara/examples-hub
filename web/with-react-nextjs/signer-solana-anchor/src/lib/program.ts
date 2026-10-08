import * as anchor from "@coral-xyz/anchor";
import type { TransferTokens } from "@/idl/transfer_tokens";
import idl from "@/idl/transfer_tokens.json";

export function getTransferTokensProgram(provider: anchor.AnchorProvider) {
  return new anchor.Program(idl as TransferTokens, provider);
}
