import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const signWithSolanaWeb3 = async (req: Request): Promise<Response> => {
  const { email }: { email: string } = await req.json();

  if (!email) {
    return new Response("Email is required in the request body", { status: 400 });
  }

  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    console.error("Server configuration error: PARA_API_KEY not set");
    return new Response("Server configuration error", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY, { disableWebSockets: true, disableWorkers: true });
  const connection = new Connection(clusterApiUrl("testnet"), "confirmed");

  try {
    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      return new Response(`Pregenerated wallet does not exist for ${email}`, { status: 404 });
    }

    const keyShare = getKeyShareInDB(email);
    if (!keyShare) {
      return new Response(`Key share not found in DB for ${email}`, { status: 404 });
    }

    let decryptedKeyShare: string;
    try {
      decryptedKeyShare = await decrypt(keyShare);
    } catch (decryptionError) {
      console.error(`Failed to decrypt key share for ${email}:`, decryptionError);
      return new Response("Failed to process key share", { status: 500 });
    }

    await para.setUserShare(decryptedKeyShare);

    if (!para.wallets || Object.keys(para.wallets).length === 0) {
      throw new Error("Failed to load wallet details after setting user share.");
    }

    const signer = new ParaSolanaWeb3Signer(para, connection);

    const senderPubKey = signer.sender;

    if (!senderPubKey) {
      throw new Error("Failed to get sender public key from ParaSolanaWeb3Signer after initialization.");
    }

    const demoTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPubKey,
        toPubkey: senderPubKey,
        lamports: LAMPORTS_PER_SOL / 1000,
      })
    );

    demoTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    demoTx.feePayer = senderPubKey;

    const txSignature = await signer.sendTransaction(demoTx);

    if (!txSignature) {
      throw new Error("sendTransaction did not return a signature.");
    }

    let receipt = null;

    while (!receipt) {
      receipt = await connection?.getSignatureStatus(txSignature, { searchTransactionHistory: true });
      if (receipt?.value?.confirmationStatus === "confirmed" || receipt?.value?.confirmationStatus === "finalized") {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({
        route: "signWithSolanaWeb3",
        status: "success",
        signature: txSignature,
        confirmationStatus: receipt?.value?.confirmationStatus,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error during signWithSolanaWeb3 process for ${email}:`, error);
    return new Response(
      `Failed to send/confirm Solana transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        status: 500,
      }
    );
  }
};
