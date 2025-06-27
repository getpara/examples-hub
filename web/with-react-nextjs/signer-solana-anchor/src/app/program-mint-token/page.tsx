"use client";

import { useParaSigner } from "@/hooks/useParaSigner";
import { useState, useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, SystemProgram, PublicKey } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { TransferTokens } from "@/idl/transfer_tokens";
import idl from "@/idl/transfer_tokens.json" assert { type: "json" };
import { PROGRAM_ID } from "@/config/constants";
import { useAccount, useWallet } from "@getpara/react-sdk";

export default function ProgramMintTokenPage() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [mintAccount, setMintAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenAccount, setTokenAccount] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState("");
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { signer, connection, anchorProvider, isConnected, address } = useParaSigner();
  const { data: wallet } = useWallet();
  const walletId = wallet?.id;

  const fetchBalances = async () => {
    if (!address || !connection || !signer) return;

    setIsBalanceLoading(true);
    try {
      // Fetch SOL balance
      const balance = await connection.getBalance(signer.sender!);
      setSolBalance((balance / LAMPORTS_PER_SOL).toFixed(4));

      // Fetch token balance if mint address is available
      if (mintAccount && mintAccount.length > 0) {
        try {
          const mint = new anchor.web3.PublicKey(mintAccount);
          const userPubkey = signer.sender!;

          // Get associated token address
          const ata = await getAssociatedTokenAddress(mint, userPubkey, false, TOKEN_2022_PROGRAM_ID);
          setTokenAccount(ata.toString());

          // Try to get token account info
          try {
            const tokenAccountInfo = await getAccount(connection, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
            
            // Get mint info to get decimals
            const mintInfo = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);
            const decimals = mintInfo.decimals;

            // Convert raw balance to display balance
            const rawBalance = tokenAccountInfo.amount;
            console.log("Raw balance:", rawBalance.toString());
            console.log("Decimals:", decimals);
            
            // Handle the balance as a string to avoid precision issues
            const balanceStr = rawBalance.toString();
            
            // If the balance is shorter than or equal to decimals, it's a fractional amount
            if (balanceStr.length <= decimals) {
              const paddedBalance = balanceStr.padStart(decimals, '0');
              const displayBalance = '0.' + paddedBalance.replace(/0+$/, '');
              setTokenBalance(displayBalance === '0.' ? '0' : displayBalance);
            } else {
              // Split into whole and fractional parts
              const wholePart = balanceStr.slice(0, -decimals);
              const fractionalPart = balanceStr.slice(-decimals).replace(/0+$/, '');
              const displayBalance = fractionalPart ? `${wholePart}.${fractionalPart}` : wholePart;
              setTokenBalance(displayBalance);
            }
          } catch (e) {
            // Token account doesn't exist
            setTokenBalance("0");
          }
        } catch (error) {
          console.error("Error fetching token balance:", error);
          setTokenBalance(null);
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      setSolBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address && connection && signer) {
      fetchBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, connection, signer, mintAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxSignature("");

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to mint tokens.");
      }

      if (!walletId) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      if (!signer || !anchorProvider) {
        throw new Error("Anchor provider is not initialized. Please reconnect your wallet.");
      }

      if (!mintAccount || !recipient || !amount) {
        throw new Error("Please fill in all fields.");
      }

      const mintPubkey = new PublicKey(mintAccount);
      const recipientPubkey = new PublicKey(recipient);
      
      // Validate amount
      const mintAmount = parseFloat(amount);
      if (isNaN(mintAmount) || mintAmount <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      anchor.setProvider(anchorProvider);
      const program = new anchor.Program(idl as TransferTokens, anchorProvider);

      // Get mint info to get decimals
      const mintInfo = await getMint(connection!, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
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
        .accounts({
          payer: signer.sender!,
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
      setStatus({
        show: true,
        type: "success",
        message: `Successfully minted ${amount} tokens to ${recipient}!`,
      });

      await fetchBalances();

      // Clear form
      setAmount("");
      setRecipient("");
    } catch (error) {
      console.error("Error minting tokens:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to mint tokens. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Mint Token Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Interact with deployed programs to mint tokens. Learn how to call program methods and handle the responses.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Balances:</h3>
            <button
              onClick={fetchBalances}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balances">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3 space-y-2">
            <div>
              <p className="text-sm text-gray-500">SOL Balance:</p>
              <p className="text-lg font-medium text-gray-900">
                {!address
                  ? "Please connect wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : solBalance
                  ? `${solBalance} SOL`
                  : "Unable to fetch"}
              </p>
            </div>
            {mintAccount && (
              <div>
                <p className="text-sm text-gray-500">Token Balance:</p>
                <p className="text-lg font-medium text-gray-900">
                  {!address
                    ? "Please connect wallet"
                    : isBalanceLoading
                    ? "Loading..."
                    : tokenBalance !== null
                    ? `${tokenBalance} tokens`
                    : "Unable to fetch"}
                </p>
              </div>
            )}
          </div>
        </div>

        {status.show && (
          <div
            className={`mb-4 rounded-none border ${
              status.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : status.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-gray-50 border-gray-500 text-gray-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="mintAccount"
              className="block text-sm font-medium text-gray-700">
              Mint Account Address
            </label>
            <input
              id="mintAccount"
              type="text"
              value={mintAccount}
              onChange={(e) => setMintAccount(e.target.value)}
              placeholder="Enter the token mint address"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient's address"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Amount to Mint
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              step="0.01"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!mintAccount || !recipient || !amount || isLoading}>
            {isLoading ? "Minting Tokens..." : "Mint Tokens"}
          </button>

          {txSignature && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Transaction Signature:</h3>
                <a
                  href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                  View on Solscan
                </a>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {txSignature}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}