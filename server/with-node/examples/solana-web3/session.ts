import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function solanaSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = req.body.session as string | undefined;

    if (!session) {
      res.status(400).send("Provide `session` in the request body.");
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    if (!paraApiKey) {
      res.status(500).send("PARA_API_KEY is not set.");
      return;
    }

    const env = process.env.PARA_ENVIRONMENT as Environment || Environment.BETA;
    const para = new ParaServer(env, paraApiKey);
    await para.importSession(session);

    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

    if (!solanaSigner.sender) {
      res.status(500).send("Failed to initialize Solana sender address from Para session.");
      return;
    }

    const demoTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: solanaSigner.sender,
        lamports: LAMPORTS_PER_SOL / 1000,
      })
    );

    const signedTransaction = await solanaSigner.signTransaction(demoTx);

    res.status(200).json({
      message: "Transaction signed using Solana-Web3 + Para (session-based wallet).",
      signedTransaction: signedTransaction,
    });
  } catch (error) {
    console.error("Error in solanaSessionSignHandler:", error);
    next(error);
  }
}
