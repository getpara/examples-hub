import { Address } from "@solana/addresses";
import { 
  createTransactionMessage, 
  appendTransactionMessageInstruction, 
  setTransactionMessageFeePayer, 
  setTransactionMessageLifetimeUsingBlockhash,
  pipe,
  lamports,
  Signature
} from "@solana/kit";
import { compileTransaction, getBase64EncodedWireTransaction } from "@solana/transactions";
import { getTransferSolInstruction } from "@solana-program/system";
import type { Rpc } from "@solana/rpc-spec";
import type { SolanaRpcApi } from "@solana/rpc-api";
import type { ParaSolanaSigner } from "@getpara/solana-signers-v2-integration";
import { LAMPORTS_PER_SOL, RETRY_DELAY_MS, MAX_RETRIES } from "@/config/constants";

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Failed after retries");
}

/**
 * Constructs a SOL transfer transaction
 */
export async function constructSolTransferTransaction(
  signer: ParaSolanaSigner,
  toAddress: Address,
  solAmount: string,
  rpc: Rpc<SolanaRpcApi>
) {
  const amountLamports = lamports(BigInt(parseFloat(solAmount) * Number(LAMPORTS_PER_SOL)));
  
  console.log("Constructing transaction:", {
    from: signer.address,
    to: toAddress,
    amount: solAmount + " SOL",
    amountLamports: amountLamports.toString()
  });

  // Check sender balance first
  try {
    const balanceResponse = await rpc.getBalance(signer.address).send();
    const balance = balanceResponse.value;
    console.log("Sender balance:", {
      lamports: balance.toString(),
      sol: (Number(balance) / Number(LAMPORTS_PER_SOL)).toFixed(4)
    });
    
    if (balance < amountLamports + BigInt(5000)) { // 5000 lamports for fees
      throw new Error(`Insufficient balance. Required: ${(Number(amountLamports) + 5000) / Number(LAMPORTS_PER_SOL)} SOL, Available: ${Number(balance) / Number(LAMPORTS_PER_SOL)} SOL`);
    }
  } catch (balanceError) {
    console.error("Error checking balance:", balanceError);
    throw balanceError;
  }

  // Get latest blockhash with retry
  const response = await retryWithBackoff(() => 
    rpc.getLatestBlockhash().send()
  );
  const { blockhash, lastValidBlockHeight } = response.value;
  
  console.log("Got blockhash:", blockhash);
  
  const transferInstruction = getTransferSolInstruction({
    source: signer,
    destination: toAddress,
    amount: amountLamports,
  });
  
  console.log("Created transfer instruction:", {
    programAddress: transferInstruction.programAddress,
    accountsCount: transferInstruction.accounts?.length || 0
  });

  const transactionMessage = pipe(
    createTransactionMessage({ version: "legacy" }),
    (tx) => setTransactionMessageFeePayer(signer.address, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash({ blockhash, lastValidBlockHeight }, tx),
    (tx) => appendTransactionMessageInstruction(transferInstruction, tx)
  );

  const compiledTransaction = compileTransaction(transactionMessage);
  
  console.log("Transaction compiled:", {
    messageBytes: compiledTransaction.messageBytes?.length || 0,
    version: "legacy"
  });

  return compiledTransaction;
}

/**
 * Signs and sends a transaction
 */
export async function signAndSendTransaction(
  transaction: any,
  signer: ParaSolanaSigner,
  rpc: Rpc<SolanaRpcApi>
): Promise<Signature> {
  try {
    console.log("Signing transaction...");
    // Sign the transaction
    const signedTxs = await signer.modifyAndSignTransactions([transaction]);
    const signedTx = signedTxs[0];
    
    console.log("Transaction signed successfully:", {
      signaturesCount: Object.keys(signedTx.signatures || {}).length,
      address: signer.address
    });
    
    // Serialize and send
    const serializedTx = getBase64EncodedWireTransaction(signedTx);
    console.log("Transaction serialized, length:", serializedTx.length);
    
    // Try simulating the transaction first to catch issues early
    try {
      console.log("Simulating transaction...");
      const simulation = await rpc.simulateTransaction(serializedTx, {
        encoding: "base64",
        commitment: "processed"
      }).send();
      
      if (simulation.value.err) {
        console.error("Transaction simulation failed:", simulation.value.err);
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }
      
      console.log("Transaction simulation successful:", {
        computeUnitsConsumed: simulation.value.unitsConsumed,
        logs: simulation.value.logs?.slice(0, 3) // First 3 logs
      });
    } catch (simError) {
      console.error("Simulation error:", simError);
      throw new Error(`Transaction simulation failed: ${simError instanceof Error ? simError.message : 'Unknown error'}`);
    }

    console.log("Sending transaction to network...");
    const signature = await retryWithBackoff(() =>
      rpc.sendTransaction(serializedTx, {
        encoding: "base64",
        skipPreflight: false,
        preflightCommitment: "processed"
      }).send()
    );
    
    console.log("Transaction sent successfully:", signature);
    return signature;
  } catch (error) {
    console.error("Error in signAndSendTransaction:", error);
    throw error;
  }
}

/**
 * Waits for transaction confirmation
 */
export async function waitForConfirmation(
  signature: Signature,
  rpc: Rpc<SolanaRpcApi>,
  timeoutMs: number = 30000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const receipt = await rpc.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    }).send();
    
    const status = receipt?.value?.[0];
    if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
      return;
    }
    
    if (status?.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
  }
  
  throw new Error("Transaction confirmation timeout");
}

/**
 * Gets the estimated transaction fee
 */
export async function estimateTransactionFee(
  transaction: any,
  rpc: Rpc<SolanaRpcApi>
): Promise<bigint> {
  try {
    const serializedTx = getBase64EncodedWireTransaction(transaction);
    const response = await rpc.getFeeForMessage(serializedTx as any, {
      commitment: "processed"
    }).send();
    
    return BigInt(response.value || 5000);
  } catch {
    // Return default fee if estimation fails
    return BigInt(5000);
  }
}