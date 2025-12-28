"use client";

import { useState, useCallback, useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, PublicKey, Connection } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { TransferTokens } from "@/idl/transfer_tokens";
import idl from "@/idl/transfer_tokens.json";
import { useParaSigner } from "./useParaSigner";

async function fetchTokenBalance(
  connection: Connection,
  mintAddress: string,
  ownerPubkey: PublicKey
): Promise<string | null> {
  try {
    const mint = new PublicKey(mintAddress);
    const ata = await getAssociatedTokenAddress(mint, ownerPubkey, false, TOKEN_2022_PROGRAM_ID);

    try {
      const tokenAccountInfo = await getAccount(connection, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
      const mintInfo = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);
      const decimals = mintInfo.decimals;

      const balanceStr = tokenAccountInfo.amount.toString();

      if (balanceStr.length <= decimals) {
        const paddedBalance = balanceStr.padStart(decimals, "0");
        const displayBalance = "0." + paddedBalance.replace(/0+$/, "");
        return displayBalance === "0." ? "0" : displayBalance;
      } else {
        const wholePart = balanceStr.slice(0, -decimals);
        const fractionalPart = balanceStr.slice(-decimals).replace(/0+$/, "");
        return fractionalPart ? `${wholePart}.${fractionalPart}` : wholePart;
      }
    } catch {
      return "0";
    }
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return null;
  }
}

export function useMintToken(mintAddress: string) {
  const { signer, connection, anchorProvider, isReady } = useParaSigner();

  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!connection || !signer?.sender || !mintAddress) return;

    setIsBalanceLoading(true);
    try {
      const balance = await fetchTokenBalance(connection, mintAddress, signer.sender);
      setTokenBalance(balance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [connection, signer, mintAddress]);

  useEffect(() => {
    if (connection && signer?.sender && mintAddress) {
      fetchBalance();
    }
  }, [connection, signer, mintAddress, fetchBalance]);

  const mintToken = useCallback(
    async (recipient: string, amount: string) => {
      if (!signer || !connection || !anchorProvider) {
        setError(new Error("Signer not initialized. Please connect your wallet."));
        return;
      }

      if (!mintAddress || !recipient || !amount) {
        setError(new Error("Please fill in all fields."));
        return;
      }

      const mintAmount = parseFloat(amount);
      if (isNaN(mintAmount) || mintAmount <= 0) {
        setError(new Error("Please enter a valid amount greater than 0."));
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxSignature(null);

      try {
        const mintPubkey = new PublicKey(mintAddress);
        const recipientPubkey = new PublicKey(recipient);

        anchor.setProvider(anchorProvider);
        const program = new anchor.Program(idl as TransferTokens, anchorProvider);

        // Get mint info to get decimals
        const mintInfo = await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
        const decimals = mintInfo.decimals;

        // Convert display amount to raw amount
        const rawAmount = new anchor.BN(mintAmount * Math.pow(10, decimals));

        // Get associated token address for recipient
        const recipientAta = await getAssociatedTokenAddress(
          mintPubkey,
          recipientPubkey,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        const tx = await program.methods
          .mintToken(rawAmount)
          .accountsPartial({
            payer: signer.sender,
            mintAccount: mintPubkey,
            associatedTokenAccount: recipientAta,
            recipient: recipientPubkey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .rpc();

        setTxSignature(tx);

        // Refresh token balance
        await fetchBalance();
      } catch (err) {
        console.error("Error minting tokens:", err);
        setError(err instanceof Error ? err : new Error("Failed to mint tokens. Please try again."));
      } finally {
        setIsLoading(false);
      }
    },
    [signer, connection, anchorProvider, mintAddress, fetchBalance]
  );

  const reset = useCallback(() => {
    setTxSignature(null);
    setError(null);
  }, []);

  return {
    mintToken,
    fetchBalance,
    txSignature,
    tokenBalance,
    isLoading,
    isBalanceLoading,
    isReady,
    error,
    reset,
  };
}
