"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Transaction, LAMPORTS_PER_SOL, SystemProgram, VersionedTransaction } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { TransferTokens } from "../../target/types/transfer_tokens";

import idl from "../../target/idl/transfer_tokens.json" assert { type: "json" };
import { PROGRAM_ID } from ".";

export default function ProgramMintToken() {
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

  const { isConnected, walletId, address, signer, connection, anchorProvider } = usePara();

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

          const tokenAccountAddress = await getAssociatedTokenAddress(
            mint,
            userPubkey,
            false, // allowOwnerOffCurve
            TOKEN_2022_PROGRAM_ID // Use Token Extension Program
          );

          setTokenAccount(tokenAccountAddress.toString());

          try {
            try {
              const accountInfo = await getAccount(connection, tokenAccountAddress, "confirmed", TOKEN_2022_PROGRAM_ID);

              const mintInfo = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);

              const decimals = mintInfo.decimals;
              const uiAmount = Number(accountInfo.amount) / Math.pow(10, decimals);
              setTokenBalance(uiAmount.toString());
            } catch (error) {
              // If token-2022 fails, try the original token program
              const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccountAddress);
              setTokenBalance(tokenAccountInfo.value.uiAmount?.toString() || "0");
            }
          } catch (error) {
            console.log("No token account found, balance is 0");
            setTokenBalance("0");
          }
        } catch (error) {
          console.error("Error fetching token account:", error);
          setTokenAccount(null);
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
  }, [address, connection, signer, mintAccount]);

  const handleMintToken = async (e: React.FormEvent) => {
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

      if (!mintAccount) {
        throw new Error("Please enter a mint account address.");
      }

      if (!recipient) {
        throw new Error("Please enter a recipient address.");
      }

      // Validate amount
      const amountValue = parseInt(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      const mintPubkey = new anchor.web3.PublicKey(mintAccount);
      const recipientPubkey = new anchor.web3.PublicKey(recipient);

      if (!anchorProvider) {
        throw new Error("Anchor provider is not initialized. Please reconnect your wallet.");
      }

      anchor.setProvider(anchorProvider);

      const program = new anchor.Program(idl as TransferTokens, anchorProvider);

      const signature = await program.methods
        .mintToken(new anchor.BN(amountValue))
        .accounts({
          mintAuthority: signer.sender!,
          recipient: recipientPubkey,
          mintAccount: mintPubkey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxSignature(signature);

      setStatus({
        show: true,
        type: "success",
        message: `Successfully minted ${amount} tokens to ${recipient}!`,
      });

      // Refresh balances
      await fetchBalances();

      // Reset form
      setAmount("");
    } catch (error: any) {
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
        <h1 className="text-4xl font-bold tracking-tight mb-6">Mint Tokens Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          This demo shows how to mint tokens using the transfer_tokens program deployed at address{" "}
          {PROGRAM_ID.toString()}.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Account Information:</h3>
            <button
              onClick={fetchBalances}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh data">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3 space-y-2">
            <div>
              <p className="text-sm text-gray-600">Your Address:</p>
              <p className="text-sm font-mono break-all text-gray-900">
                {!address ? "Please connect your wallet" : address}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">SOL Balance:</p>
              <p className="text-lg font-medium text-gray-900">
                {!address
                  ? "Please connect your wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : solBalance
                  ? `${solBalance} SOL`
                  : "Unable to fetch balance"}
              </p>
            </div>
            {mintAccount && (
              <>
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
                <div>
                  <p className="text-sm text-gray-600">Token Balance:</p>
                  <p className="text-lg font-medium text-gray-900">
                    {!address
                      ? "Please connect your wallet"
                      : isBalanceLoading
                      ? "Loading..."
                      : tokenBalance !== null
                      ? tokenBalance
                      : "Unable to fetch balance"}
                  </p>
                </div>
              </>
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
                : "bg-blue-50 border-blue-500 text-blue-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <form
          onSubmit={handleMintToken}
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
              placeholder="Enter mint account public key"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
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
              placeholder="Enter recipient public key"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
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
              placeholder="Enter amount to mint"
              min="1"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500">
              Note: The amount will be adjusted for decimals (9 decimals) in the contract
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!mintAccount || !recipient || !amount || isLoading || !isConnected}>
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
