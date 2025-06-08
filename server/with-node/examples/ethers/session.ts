import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";

export async function ethersSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const env = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
    const para = new ParaServer(env, paraApiKey);
    await para.importSession(session);

    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider as any);

    const address = await paraEthersSigner.getAddress();
    const feeData = await ethersProvider.getFeeData();
    const nonce = await ethersProvider.getTransactionCount(address);

    const tx = {
      to: address,
      value: ethers.parseEther("0.0001"),
      nonce: nonce,
      gasLimit: 21000,
      gasPrice: feeData.gasPrice,
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
