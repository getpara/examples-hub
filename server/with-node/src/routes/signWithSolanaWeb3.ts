import type { Request, Response } from "express";
import { Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createParaServer } from "../utils/createParaServer.js";

export async function solanaPregenSignHandler(req: Request, res: Response): Promise<void> {
  const PARA_API_KEY = process.env.PARA_API_KEY;
  const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
  // Only used to fetch a recent blockhash for the demo transaction, which is
  // signed but never broadcast. Override with SOLANA_RPC_URL if desired.
  const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://solana-testnet-rpc.publicnode.com";
  try {
    const email = req.body.email as string | undefined;

    if (!email) {
      res.status(400).json({ success: false, message: "Provide email in the request body" });
      return;
    }

    if (!PARA_API_KEY) {
      res.status(500).json({ success: false, message: "PARA_API_KEY is not set" });
      return;
    }

    const para = createParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });
    if (!hasPregenWallet) {
      res.status(400).json({ success: false, message: "No pre-generated wallet found for this email" });
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).json({ success: false, message: "Key share not found" });
      return;
    }
    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const connection = new Connection(SOLANA_RPC_URL);
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

    if (!solanaSigner.sender) {
      res.status(500).json({ success: false, message: "Failed to initialize Solana sender address from Para wallet" });
      return;
    }

    // Get recent blockhash for the transaction
    const { blockhash } = await connection.getLatestBlockhash();

    const demoTx = new Transaction();
    demoTx.recentBlockhash = blockhash;
    demoTx.feePayer = solanaSigner.sender;

    demoTx.add(
      SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: solanaSigner.sender,
        lamports: LAMPORTS_PER_SOL / 1000, // Example: 0.001 SOL
      })
    );

    await solanaSigner.signTransaction(demoTx);

    res.status(200).json({
      success: true,
      message: "Transaction signed using Solana-Web3 + Para (pre-generated wallet)",
    });
  } catch (error) {
    console.error("Error in solanaPregenSignHandler:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to sign transaction",
    });
  }
}
