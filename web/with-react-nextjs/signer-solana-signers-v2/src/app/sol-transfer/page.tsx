"use client";

import { useParaSigner } from "@/hooks/useParaSigner";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { Address } from "@solana/addresses";
import { getBase58Decoder, getBase58Encoder } from "@solana/codecs-strings";
import { 
  createTransactionMessage, 
  appendTransactionMessageInstruction, 
  setTransactionMessageFeePayer, 
  setTransactionMessageLifetimeUsingBlockhash,
  pipe,
  lamports,
  signTransactionMessageWithSigners,
  SignatureBytes,
  assertIsSignature,
  Signature
} from "@solana/kit";
import { compileTransaction } from "@solana/transactions";
import { getTransferSolInstruction } from "@solana-program/system";
const LAMPORTS_PER_SOL = BigInt(1000000000);
import { useState, useEffect } from "react";

export default function SolTransferPage() {
  const [to, setTo] = useState("" as Address);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { signer, rpc } = useParaSigner();
  const { data: account } = useAccount();
  const { data: wallet } = useWallet();

  const address = wallet?.address;
  const isConnected = account?.isConnected;

  const fetchBalance = async () => {
    if (!address || !rpc) return;

    setIsBalanceLoading(true);
    try {
      const response = await rpc.getBalance(signer?.address!).send();
      console.log("Balance response:", response);
      const balanceLamports = response.value;
      setBalance((Number(balanceLamports) / Number(LAMPORTS_PER_SOL)).toFixed(4));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address && signer) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, signer]);

  const constructTransaction = async (toAddress: Address, solAmount: string) => {
    if (!address || !rpc) throw new Error("No sender address or RPC client available");

    try {
      const fromAddress = signer?.address!;
      const amountLamports = lamports(BigInt(parseFloat(solAmount) * Number(LAMPORTS_PER_SOL)));

      const response = await rpc.getLatestBlockhash().send();
      const { blockhash, lastValidBlockHeight } = response.value;
      
      const transferInstruction = getTransferSolInstruction({
        source: signer!,
        destination: toAddress,
        amount: amountLamports,
      });
      
      console.log("Transfer instruction:", {
        programAddress: transferInstruction.programAddress,
        accounts: transferInstruction.accounts,
        data: transferInstruction.data,
        dataLength: transferInstruction.data?.length
      });

      // Try creating a legacy transaction instead of version 0
      const transactionMessage = pipe(
        createTransactionMessage({ version: "legacy" }),
        (tx) => setTransactionMessageFeePayer(signer!.address, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash({ blockhash, lastValidBlockHeight }, tx),
        (tx) => appendTransactionMessageInstruction(transferInstruction, tx)
      );

      console.log("Transaction message before compile:", {
        version: transactionMessage.version,
        feePayer: transactionMessage.feePayer,
        instructions: transactionMessage.instructions?.length,
        lifetimeConstraint: transactionMessage.lifetimeConstraint
      });

      // Use compileTransaction which should properly handle the encoding
      const transaction = compileTransaction(transactionMessage);
      
      // Log the transaction structure
      console.log("Compiled transaction:", {
        hasMessageBytes: !!transaction.messageBytes,
        messageBytesType: transaction.messageBytes?.constructor?.name,
        messageBytesLength: transaction.messageBytes?.length || 0,
        signatures: transaction.signatures,
        signatureCount: Object.keys(transaction.signatures || {}).length
      });
      
      // Log first few bytes of messageBytes to check format
      if (transaction.messageBytes && transaction.messageBytes.length > 0) {
        console.log("First 10 bytes of messageBytes:", Array.from(transaction.messageBytes.slice(0, 10)));
        console.log("Is Uint8Array:", transaction.messageBytes instanceof Uint8Array);
        
        // Log the hex representation of the first few bytes
        const hexString = Array.from(transaction.messageBytes.slice(0, 20))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');
        console.log("First 20 bytes as hex:", hexString);
        
        // Check if this looks like a valid transaction
        const firstByte = transaction.messageBytes[0];
        console.log("First byte (version/signature count):", firstByte);
        if (firstByte === 128) {
          console.log("This appears to be a versioned transaction (v0)");
        } else if (firstByte > 0 && firstByte < 128) {
          console.log("This appears to be a legacy transaction with", firstByte, "signatures");
        }
      }
      
      return transaction;
    } catch (error) {
      console.error("Error constructing transaction:", error);
      throw error;
    }
  };

  const validateTransaction = async (toAddress: Address, solAmount: string): Promise<boolean> => {
    if (!address || !rpc) throw new Error("No sender address or RPC client available");

    try {
      const response = await rpc.getBalance(signer?.address!).send();
      const balanceLamports = response.value;
      const amountLamports = parseFloat(solAmount) * Number(LAMPORTS_PER_SOL);
      const estimatedFee = 5000; // Rough estimate for transfer transaction
      const totalCost = amountLamports + estimatedFee;

      if (totalCost > Number(balanceLamports)) {
        const requiredSol = (totalCost / Number(LAMPORTS_PER_SOL)).toFixed(4);
        const availableSol = (Number(balanceLamports) / Number(LAMPORTS_PER_SOL)).toFixed(4);
        throw new Error(
          `Insufficient balance. Transaction requires approximately ${requiredSol} SOL, but you have only ${availableSol} SOL available.`
        );
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxSignature(null);

    try {
      if (!isConnected) {
        setStatus({
          show: true,
          type: "error",
          message: "Please connect your wallet to send a transaction.",
        });
        return;
      }

      if (!signer) {
        setStatus({
          show: true,
          type: "error",
          message: "No signer found. Please reconnect your wallet.",
        });
        return;
      }

      if (!to || to.length < 32) {
        setStatus({
          show: true,
          type: "error",
          message: "Invalid recipient address format.",
        });
        return;
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        setStatus({
          show: true,
          type: "error",
          message: "Please enter a valid amount greater than 0.",
        });
        return;
      }

      await validateTransaction(to, amount);

      const tx = await constructTransaction(to as Address, amount);
      console.log("Constructed transaction:", tx);
      console.log("Transaction messageBytes:", tx.messageBytes);
      console.log("Transaction signatures:", tx.signatures);
      
      // Log the transaction structure
      if (tx.messageBytes) {
        console.log("MessageBytes length:", tx.messageBytes.length);
        console.log("MessageBytes type:", typeof tx.messageBytes);
      }

      let txSignatures;
      try {
        console.log("About to sign and send transaction...");
        
        // Try to simulate the transaction first to see if it's valid
        try {
          console.log("Attempting to simulate transaction first...");
          // Note: We can't simulate unsigned transactions with the new API
          // but we can at least check if the structure looks correct
        } catch (simError) {
          console.error("Simulation error:", simError);
        }
        
        // Let's go back to using signAndSendTransactions but with more debugging
        console.log("Using signAndSendTransactions...");
        
        // Log the transaction just before signing
        console.log("Transaction before signing:", {
          messageBytes: tx.messageBytes ? "present" : "missing",
          messageBytesLength: tx.messageBytes?.length,
          signatures: Object.keys(tx.signatures || {}).length,
          firstSignature: Object.keys(tx.signatures || {})[0]
        });
        
        // Check if the signer is properly initialized
        console.log("Signer info:", {
          address: signer.address,
          hasSignTransactions: typeof signer.signTransactions === 'function',
          hasSignAndSendTransactions: typeof signer.signAndSendTransactions === 'function'
        });
        
        // Let's manually test the transaction serialization
        try {
          const { getBase64EncodedWireTransaction } = await import('@solana/transactions');
          
          // First sign the transaction manually
          const signedTxs = await signer.modifyAndSignTransactions([tx]);
          console.log("Manually signed transaction:", {
            signatures: Object.keys(signedTxs[0].signatures || {}),
            signaturesCount: Object.keys(signedTxs[0].signatures || {}).length
          });
          
          // Try to serialize it
          const serialized = getBase64EncodedWireTransaction(signedTxs[0]);
          console.log("Serialized transaction (base64):", serialized);
          console.log("Serialized length:", serialized.length);
          
          // Decode to see the bytes
          const decoded = Buffer.from(serialized, 'base64');
          console.log("Decoded transaction bytes (first 50):", Array.from(decoded.slice(0, 50)));
          console.log("Decoded transaction length:", decoded.length);
        } catch (serializeError) {
          console.error("Error during manual serialization test:", serializeError);
        }
        
        // Instead of using signAndSendTransactions, let's sign and send separately
        console.log("Signing transaction only (not sending)...");
        const signedTxs = await signer.modifyAndSignTransactions([tx]);
        const signedTx = signedTxs[0];
        
        console.log("Transaction signed successfully:", {
          signatures: Object.keys(signedTx.signatures || {}),
          signaturesCount: Object.keys(signedTx.signatures || {}).length
        });
        
        // Now send using our own RPC
        console.log("Sending signed transaction using our RPC...");
        const { getBase64EncodedWireTransaction } = await import('@solana/transactions');
        const serializedTx = getBase64EncodedWireTransaction(signedTx);
        
        console.log("Serialized transaction for sending:", {
          base64Length: serializedTx.length,
          decodedLength: Buffer.from(serializedTx, 'base64').length
        });
        
        const txSignature = await rpc.sendTransaction(serializedTx, {
          encoding: "base64",
          skipPreflight: false,
          preflightCommitment: "processed"
        }).send();
        
        console.log("Transaction sent successfully:", txSignature);
        // Convert SignatureBytes to string for storage and display
        const txSignatureString = txSignature as string;
        txSignatures = [txSignatureString];
        console.log("Transaction submitted:", txSignatures[0]);
      } catch (signError: any) {
        console.error("Detailed sign/send error:", signError);
        console.error("Error message:", signError.message);
        console.error("Error stack:", signError.stack);
        
        // Try to extract more details from the error
        if (signError.message && signError.message.includes("Parse error")) {
          console.error("This is a transaction parsing error. Common causes:");
          console.error("1. Network mismatch (mainnet vs devnet)");
          console.error("2. Invalid transaction format");
          console.error("3. Missing or invalid signatures");
          console.error("4. Incorrect serialization");
        }
        
        throw signError;
      }

      setTxSignature(txSignatures[0]);
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      let receipt = null;

      while (!receipt) {
        // txSignatures[0] is already a SignatureBytes or string from RPC
        // The RPC returns a Signature (not SignatureBytes)
        const signature = txSignatures[0] as unknown as Signature;
        
        receipt = await rpc?.getSignatureStatuses([signature], {
          searchTransactionHistory: true,
        }).send();
        if (receipt?.value?.[0]?.confirmationStatus === "confirmed" || receipt?.value?.[0]?.confirmationStatus === "finalized") {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      console.log("Transaction confirmed:", receipt);

      setStatus({
        show: true,
        type: "success",
        message: "Transaction confirmed and executed successfully!",
      });

      await fetchBalance();

      setTo("" as Address);
      setAmount("");
    } catch (error) {
      console.error("Error sending transaction:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send transaction. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">SOL Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send SOL with your connected wallet. This demonstrates a basic SOL transfer using the Para SDK with
          solana-signers-v2 integration via the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">ParaSolanaSigner</code>{" "}
          provider.
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              id="to"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value as Address)}
              placeholder="5jHY..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Amount (SOL)
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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!to || !amount || isLoading}>
            {isLoading ? "Sending Transaction..." : "Send Transaction"}
          </button>

          {txSignature && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Transaction Signature:</h3>
                <a
                  href={`https://solscan.io/tx/${typeof txSignature === 'string' ? txSignature : txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                  View on Solscan
                </a>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {typeof txSignature === 'string' ? txSignature : txSignature}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}