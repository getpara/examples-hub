"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Transaction, LAMPORTS_PER_SOL, SystemProgram, VersionedTransaction } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { TransferTokens } from "../../target/types/transfer_tokens";

import idl from "../../target/idl/transfer_tokens.json" assert { type: "json" };

export default function ProgramDeploymentDemo() {
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

  const { isConnected, walletId, address, signer, connection, anchorProvider } = usePara();

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
        message: `Successfully created token "${tokenName}" (${tokenSymbol})!`,
      });

      await fetchBalance();
    } catch (error: any) {
      console.error("Error creating token:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create token. Please try again.",
      });
      setCreatedMint(null);
    } finally {
      setIsCreateTokenLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Solana Program Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create tokens using the deployed Solana program. This demo shows how to interact with the{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">transfer_tokens</code>{" "}
          program.
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
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md mb-2">Network: Solana Devnet</p>
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${balance} SOL`
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
                : "bg-blue-50 border-blue-500 text-blue-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Create a New Token</h3>
          </div>
          <div className="p-6">
            <form
              onSubmit={createToken}
              className="space-y-4">
              <div className="space-y-2">
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
                  placeholder="e.g. My Test Token"
                  required
                  disabled={isCreateTokenLoading}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div className="space-y-2">
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
                  placeholder="e.g. MTT"
                  required
                  disabled={isCreateTokenLoading}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>{" "}
              <button
                type="submit"
                className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isConnected || isCreateTokenLoading || !tokenName || !tokenSymbol}>
                {isCreateTokenLoading ? "Creating Token..." : "Create Token"}
              </button>
            </form>
          </div>
        </div>

        {createdMint && (
          <div className="space-y-4">
            <div className="rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Mint Address:</h3>
                <a
                  href={`https://solscan.io/token/${createdMint}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
                  View on Solscan
                </a>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {createdMint}
                </p>
              </div>
            </div>

            {transactionHash && (
              <div className="rounded-none border border-gray-200">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Transaction Hash:</h3>
                  <a
                    href={`https://solscan.io/tx/${transactionHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
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
          </div>
        )}
      </div>
    </div>
  );
}
