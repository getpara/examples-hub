"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import { Program, AnchorProvider, BN, Idl } from "@project-serum/anchor";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import { PROGRAM_ID } from ".";

export default function ProgramInteractionDemo() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [mintAddress, setMintAddress] = useState<string | null>("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

  const [tokenAccount, setTokenAccount] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState("");
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { isConnected, walletId, address, signer, connection } = usePara();

  const fetchTokenData = async () => {
    if (!address || !connection || !signer) return;

    setIsBalanceLoading(true);
    try {
      // For demonstration, we'll just show SOL balance
      // In a real app, you'd fetch the token balance from the associated token account
      const solBalance = await connection.getBalance(signer.sender);
      setTokenBalance((solBalance / LAMPORTS_PER_SOL).toFixed(4));

      // Find the user's token account for this mint
      if (mintAddress) {
        const mint = new PublicKey(mintAddress);
        const userPubkey = signer.sender;
        const tokenAccountAddress = await getAssociatedTokenAddress(mint, userPubkey);

        setTokenAccount(tokenAccountAddress.toString());

        // You would typically fetch token balance here
        // const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccountAddress);
        // setTokenBalance(tokenAccountInfo.value.uiAmount.toString());
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address && connection && signer) {
      fetchTokenData();
    }
  }, [address, connection, signer]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxSignature("");

    if (!signer || !connection) {
      setStatus({
        show: true,
        type: "error",
        message: "Signer or connection not available",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to mint tokens.");
      }

      if (!walletId) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      // Validate amount
      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      // Convert amount to lamports/smallest units
      const mintAmount = new BN(amountFloat * LAMPORTS_PER_SOL);

      // Create a connection to use with AnchorProvider
      const anchorConnection = connection;

      // Create an Anchor provider
      const provider = new AnchorProvider(
        anchorConnection,
        {
          publicKey: signer.sender,
          signTransaction: async (tx: Transaction) => {
            return await signer.signTransaction(tx);
          },
          signAllTransactions: async (txs: Transaction[]) => {
            return await Promise.all(txs.map((tx) => signer.signTransaction(tx)));
          },
        },
        { commitment: "confirmed" }
      );

      // Create a program instance
      const program = new Program(programIdl, PROGRAM_ID, provider);

      // Get token mint address
      const mint = new PublicKey(mintAddress as string);

      // Get the associated token account
      const tokenAccountAddress = await getAssociatedTokenAddress(mint, signer.sender);

      // Check if token account exists, if not create it
      let transaction = new Transaction();

      try {
        await connection.getTokenAccountBalance(tokenAccountAddress);
      } catch (error) {
        // Token account doesn't exist, add instruction to create it
        transaction.add(
          createAssociatedTokenAccountInstruction(signer.sender, tokenAccountAddress, signer.sender, mint)
        );
      }

      // Add mint instruction using the program's interface
      transaction.add(
        await program.methods
          .mint(mintAmount)
          .accounts({
            mintAuthority: signer.sender,
            mint: mint,
            tokenAccount: tokenAccountAddress,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction()
      );

      // Set recent blockhash and fee payer
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = signer.sender;

      // Sign and send the transaction
      const signature = await signer.sendTransaction(transaction);

      setTxSignature(signature);

      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed");

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      setStatus({
        show: true,
        type: "success",
        message: `Successfully minted ${amount} tokens!`,
      });

      // Refresh token data
      await fetchTokenData();

      setAmount("");
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
        <h1 className="text-4xl font-bold tracking-tight mb-6">Program Interaction Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          This demo shows how to interact with a deployed Solana program using Anchor. Mint tokens by interacting with
          the token program at address {PROGRAM_ID.toString()}.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Account Information:</h3>
            <button
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh data">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3 space-y-2">
            <div>
              <p className="text-sm text-gray-600">SOL Balance:</p>
              <p className="text-lg font-medium text-gray-900">
                {!address
                  ? "Please connect your wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : tokenBalance
                  ? `${tokenBalance} SOL`
                  : "Unable to fetch balance"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Token Account:</p>
              <p className="text-sm font-mono break-all text-gray-600">
                {!address
                  ? "Please connect your wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : tokenAccount
                  ? tokenAccount
                  : "Not created yet"}
              </p>
            </div>
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

        <form
          onSubmit={handleMint}
          className="space-y-4">
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
              placeholder="0.0"
              step="0.01"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!amount || isLoading || !isConnected}>
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
                  className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
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
