import type { Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Environment variables
const PARA_API_KEY = process.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

export async function solanaPregenSignHandler(req: Request, res: Response): Promise<void> {
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

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

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

    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

    if (!solanaSigner.sender) {
      res.status(500).json({ success: false, message: "Failed to initialize Solana sender address from Para wallet" });
      return;
    }

    const demoTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: solanaSigner.sender,
        lamports: LAMPORTS_PER_SOL / 1000, // Example: 0.001 SOL
      })
    );

    const signedTransaction = await solanaSigner.signTransaction(demoTx);

    console.log("Solana Pregen - Signed transaction:", signedTransaction);

    res.status(200).json({
      success: true,
      message: "Transaction signed using Solana-Web3 + Para (pre-generated wallet)"
    });
  } catch (error) {
    console.error("Error in solanaPregenSignHandler:", error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to sign transaction" 
    });
  }
}
