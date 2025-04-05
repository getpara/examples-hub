import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function solanaPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = req.body.email as string | undefined;

    if (!email) {
      res.status(400).send("Provide `email` in the request body.");
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    if (!paraApiKey) {
      res.status(500).send("PARA_API_KEY is not set.");
      return;
    }

    const para = new ParaServer(Environment.BETA, paraApiKey);

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email.");
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).send("Key share not found.");
      return;
    }
    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

    if (!solanaSigner.sender) {
      res.status(500).send("Failed to initialize Solana sender address from Para wallet.");
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

    res.status(200).json({
      message: "Transaction signed using Solana-Web3 + Para (pre-generated wallet).",
      signedTransaction: signedTransaction, // Usually signTransaction returns the signed Tx object
    });
  } catch (error) {
    console.error("Error in solanaPregenSignHandler:", error);
    next(error);
  }
}
