"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import { Program, AnchorProvider, Idl } from "@project-serum/anchor";
import { PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import idl from "../../target/idl/transfer_tokens.json";
import { TOKEN_METADATA_PROGRAM_ID } from ".";

export default function ProgramCreateToken() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [deployedProgramId, setDeployedProgramId] = useState<string | null>(null);
  const [deploymentTxHash, setDeploymentTxHash] = useState<string | null>(null);
  const [createdMint, setCreatedMint] = useState<string | null>(null);
  const [tokenTxHash, setTokenTxHash] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenUri, setTokenUri] = useState("");

  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { isConnected, address, signer, connection } = usePara();

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

  const deployProgram = async () => {
    setIsDeploying(true);
    setStatus({ show: false, type: "success", message: "" });
    setDeployedProgramId(null);
    setDeploymentTxHash(null);

    if (!signer || !connection) {
      setStatus({
        show: true,
        type: "error",
        message: "Signer or connection not available",
      });
      setIsDeploying(false);
      return;
    }

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to deploy the program.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Generating program keypair...",
      });

      // Generate a new keypair for the program
      const programKeypair = Keypair.generate();

      // In a real deployment scenario, we would:
      // 1. Build the program (which you've already done via Anchor CLI)
      // 2. Load the compiled BPF from target/deploy/*.so
      // 3. Create a BPF loader transaction to deploy the program

      // Since we can't actually deploy the program in this web context
      // (it requires the compiled .so file which needs secure handling),
      // we'll simulate deployment by using your pre-deployed program ID

      // Simulate deployment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Use the prepopulated program ID from your Anchor.toml
      const programId = new PublicKey("5gscQip1qnTz73BMcBPn8VQivyW9rLs1sfLoi5tqPuot");

      setDeployedProgramId(programId.toString());

      // Create a fake transaction hash for demo purposes
      const mockTxHash = "SimulatedDeployment" + Math.random().toString(36).substring(2, 15);
      setDeploymentTxHash(mockTxHash);

      setStatus({
        show: true,
        type: "success",
        message:
          "Program deployment simulated successfully! In a real deployment, you would upload the program binary and execute a BPF loader transaction.",
      });

      // Refresh balance
      await fetchBalance();
    } catch (error: any) {
      console.error("Error deploying program:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to deploy program. Please try again.",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const createToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingToken(true);
    setStatus({ show: false, type: "success", message: "" });
    setCreatedMint(null);
    setTokenTxHash(null);

    if (!signer || !connection) {
      setStatus({
        show: true,
        type: "error",
        message: "Signer or connection not available",
      });
      setIsCreatingToken(false);
      return;
    }

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to create a token.");
      }

      if (!deployedProgramId) {
        throw new Error("Please deploy the program first.");
      }

      if (!tokenName || !tokenSymbol || !tokenUri) {
        throw new Error("Please fill in all token details.");
      }

      const programId = new PublicKey(deployedProgramId);

      // Create an Anchor provider
      const provider = new AnchorProvider(
        connection,
        {
          publicKey: signer.sender!,
          signTransaction: async (tx: Transaction) => {
            return await signer.signTransaction(tx);
          },
          signAllTransactions: async (txs: Transaction[]) => {
            return await Promise.all(txs.map((tx) => signer.signTransaction(tx)));
          },
        },
        { commitment: "confirmed" }
      );

      const program = new Program(idl as any, programId, provider);

      // Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      setCreatedMint(mintKeypair.publicKey.toString());

      const [metadataAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
      );

      let transaction = new Transaction();

      transaction.add(
        await program.methods
          .createToken(tokenName, tokenSymbol, tokenUri)
          .accounts({
            payer: signer.sender,
            mintAccount: mintKeypair.publicKey,
            metadataAccount: metadataAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
          })
          .instruction()
      );

      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = signer.sender;

      transaction.partialSign(mintKeypair);

      // Sign and send the transaction
      const signature = await signer.sendTransaction(transaction);
      setTokenTxHash(signature);

      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed");

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      setStatus({
        show: true,
        type: "success",
        message: `Successfully created token "${tokenName}" (${tokenSymbol})!`,
      });

      // Refresh balance
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
      setIsCreatingToken(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Solana Program Deployment Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Deploy a Solana program and create tokens using it. This demonstrates program deployment and token creation.
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

        {/* Program Deployment Section */}
        <div className="bg-white border border-gray-200 mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Step 1: Deploy Program</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Deploy the transfer_tokens Solana program to the blockchain. You must deploy the program before creating
              tokens.
            </p>
            <button
              onClick={deployProgram}
              className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isConnected || isDeploying || !!deployedProgramId}>
              {isDeploying ? "Deploying Program..." : deployedProgramId ? "Program Deployed" : "Deploy Program"}
            </button>
          </div>
        </div>

        {deployedProgramId && (
          <div className="space-y-4 mb-8">
            <div className="rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Program ID:</h3>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {deployedProgramId}
                </p>
              </div>
            </div>

            {deploymentTxHash && (
              <div className="rounded-none border border-gray-200">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Deployment Transaction:</h3>
                  {!deploymentTxHash.startsWith("Simulated") && (
                    <a
                      href={`https://solscan.io/tx/${deploymentTxHash}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
                      View on Solscan
                    </a>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                    {deploymentTxHash}
                  </p>
                  {deploymentTxHash.startsWith("Simulated") && (
                    <p className="text-xs text-gray-500 mt-2">
                      Note: This is a simulated deployment. In a production environment, you would deploy the actual
                      program binary.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Token Creation Section */}
        <div className="bg-white border border-gray-200 mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Step 2: Create a New Token</h3>
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
                  disabled={isCreatingToken || !deployedProgramId}
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
                  disabled={isCreatingToken || !deployedProgramId}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="tokenUri"
                  className="block text-sm font-medium text-gray-700">
                  Token URI
                </label>
                <input
                  id="tokenUri"
                  type="text"
                  value={tokenUri}
                  onChange={(e) => setTokenUri(e.target.value)}
                  placeholder="e.g. https://example.com/token-metadata.json"
                  required
                  disabled={isCreatingToken || !deployedProgramId}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-500">URI to JSON metadata for your token (image, description, etc.)</p>
              </div>

              <button
                type="submit"
                className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !isConnected || isCreatingToken || !tokenName || !tokenSymbol || !tokenUri || !deployedProgramId
                }>
                {isCreatingToken ? "Creating Token..." : "Create Token"}
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

            {tokenTxHash && (
              <div className="rounded-none border border-gray-200">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Token Transaction Hash:</h3>
                  <a
                    href={`https://solscan.io/tx/${tokenTxHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
                    View on Solscan
                  </a>
                </div>
                <div className="p-6">
                  <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                    {tokenTxHash}
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
