import * as anchor from "@coral-xyz/anchor";
import { TransferTokens } from "@/idl/transfer_tokens";
import idl from "@/idl/transfer_tokens.json" assert { type: "json" };

export function getProgram(provider: anchor.AnchorProvider): anchor.Program<TransferTokens> {
  return new anchor.Program(idl as TransferTokens, provider);
}