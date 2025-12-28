"use client";

import { useState, useCallback } from "react";
import * as anchor from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { TransferTokens } from "@/idl/transfer_tokens";
import idl from "@/idl/transfer_tokens.json";
import { useParaSigner } from "./useParaSigner";

export function useCreateToken() {
  const { signer, anchorProvider, isReady } = useParaSigner();

  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createToken = useCallback(
    async (tokenName: string, tokenSymbol: string) => {
      if (!signer || !anchorProvider) {
        setError(new Error("Signer not initialized. Please connect your wallet."));
        return;
      }

      if (!tokenName || !tokenSymbol) {
        setError(new Error("Please fill in all token details."));
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxSignature(null);
      setMintAddress(null);

      try {
        anchor.setProvider(anchorProvider);

        const program = new anchor.Program(idl as TransferTokens, anchorProvider);

        const mintKeypair = anchor.web3.Keypair.generate();
        setMintAddress(mintKeypair.publicKey.toString());

        const tx = await program.methods
          .createToken(tokenName, tokenSymbol)
          .accountsPartial({
            payer: signer.sender,
            mintAccount: mintKeypair.publicKey,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([mintKeypair])
          .rpc();

        setTxSignature(tx);
      } catch (err) {
        console.error("Error creating token:", err);
        setError(err instanceof Error ? err : new Error("Error creating token. Please try again."));
        setMintAddress(null);
      } finally {
        setIsLoading(false);
      }
    },
    [signer, anchorProvider]
  );

  const reset = useCallback(() => {
    setTxSignature(null);
    setMintAddress(null);
    setError(null);
  }, []);

  return {
    createToken,
    txSignature,
    mintAddress,
    isLoading,
    isReady,
    error,
    reset,
  };
}
