import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";

export async function ethersSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, session } = req.body as { email?: string; session?: string };
    if (!email || !session) {
      res.status(400).send("Provide both `email` and `session` in the request body.");
      return;
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    await para.importSession(session);

    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider);

    const address = await paraEthersSigner.getAddress();

    const tx = {
      to: address,
      from: address,
      value: ethers.parseEther("0.001"),
      nonce: await ethersProvider.getTransactionCount(address),
      gasLimit: 21000,
      gasPrice: (await ethersProvider.getFeeData()).gasPrice,
    };

    const signedTx = await paraEthersSigner.signTransaction(tx);

    res.status(200).json({
      message: "Transaction signed using Ethers + Para (session-based wallet).",
      signedTransaction: signedTx,
    });
  } catch (error) {
    console.error("Error in ethersSessionSignHandler:", error);
    next(error);
  }
}
