"use client";

import { useParaSigner } from "@/hooks/useParaSigner";
import { useState, useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { TransferTokens } from "@/idl/transfer_tokens";
import idl from "@/idl/transfer_tokens.json" assert { type: "json" };
import { useAccount, useWallet } from "@getpara/react-sdk";

export default function ProgramCreateTokenPage() {
  const [isCreateTokenLoading, setIsCreateTokenLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [createdMint, setCreatedMint] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { signer, connection, anchorProvider, isConnected, address } = useParaSigner();
  const { data: wallet } = useWallet();
  const walletId = wallet?.id;

  const fetchBalance = async () => {
    if (!address || !connection || !signer) return;

    setIsBalanceLoading(true);
    try {
      const balanceInLamports = await connection.getBalance(signer.sender!);
      setBalance((balanceInLamports / LAMPORTS_PER_SOL).toFixed(4));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address && connection && signer) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, connection, signer]);

  const createToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateTokenLoading(true);
    setStatus({ show: false, type: "success", message: "" });

    if (!signer || !connection) {
      setStatus({
        show: true,
        type: "error",
        message: "Signer or connection not available",
      });
      setIsCreateTokenLoading(false);
      return;
    }

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to create a token.");
      }

      if (!walletId) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      if (!tokenName || !tokenSymbol) {
        throw new Error("Please fill in all token details.");
      }

      if (!anchorProvider) {
        throw new Error("Anchor provider is not initialized. Please reconnect your wallet.");
      }

      anchor.setProvider(anchorProvider);

      const program = new anchor.Program(idl as TransferTokens, anchorProvider);

      const mintKeypair = anchor.web3.Keypair.generate();
      setCreatedMint(mintKeypair.publicKey.toString());

      const tx = await program.methods
        .createToken(tokenName, tokenSymbol)
        .accounts({
          payer: signer.sender!,
          mintAccount: mintKeypair.publicKey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();

      setTransactionHash(tx);

      setStatus({
        show: true,
        type: "success",
        message: "Token created successfully!",
      });

      await fetchBalance();

      setTokenName("");
      setTokenSymbol("");
    } catch (error) {
      console.error("Error creating token:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Error creating token. Please try again.",
      });
    } finally {
      setIsCreateTokenLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Create Token Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Deploy your own instance of a token program and create tokens. This demonstrates how to interact with
          Anchor programs using the Para SDK.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Current Balance:</h3>
            <button
              onClick={fetchBalance}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-none">Network: Devnet</p>
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${parseFloat(balance).toFixed(4)} SOL`
                : "Unable to fetch balance"}
            </p>
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

        {createdMint && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-none">
            <p className="text-sm font-medium text-gray-700">Created Mint Address:</p>
            <p className="font-mono text-xs break-all text-gray-600 mt-1">{createdMint}</p>
          </div>
        )}

        <form
          onSubmit={createToken}
          className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="tokenName"
              className="block text-sm font-medium text-gray-700">
              Token Name
            </label>
            <input
              id="tokenName"
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="My Token"
              required
              disabled={isCreateTokenLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="tokenSymbol"
              className="block text-sm font-medium text-gray-700">
              Token Symbol
            </label>
            <input
              id="tokenSymbol"
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="MTK"
              required
              disabled={isCreateTokenLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!tokenName || !tokenSymbol || isCreateTokenLoading}>
            {isCreateTokenLoading ? "Creating Token..." : "Create Token"}
          </button>

          {transactionHash && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Transaction Hash:</h3>
                <a
                  href={`https://solscan.io/tx/${transactionHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                  View on Solscan
                </a>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {transactionHash}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}