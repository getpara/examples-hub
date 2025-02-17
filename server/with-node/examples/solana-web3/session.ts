import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function solanaSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { session } = req.body as { session?: string };
    if (!session) {
      res
        .status(400)
        .send(
          "Provide `session` in the request body. This session should be previously exported from the client side."
        );
      return;
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    await para.importSession(session);

    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

    if (!solanaSigner.sender) {
      res.status(500).send("Failed to retrieve the Solana sender address from the session-based wallet.");
      return;
    }

    const demoTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: solanaSigner.sender,
        lamports: LAMPORTS_PER_SOL / 100,
      })
    );

    const signatureResult = await solanaSigner.signTransaction(demoTx);

    res.status(200).json({
      message: "Transaction signed using Solana-Web3 + Para (session-based wallet).",
      signatureResult,
    });
  } catch (error) {
    console.error("Error in solanaSessionSignHandler:", error);
    next(error);
  }
}
