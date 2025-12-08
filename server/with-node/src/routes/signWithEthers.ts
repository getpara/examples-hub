import type { Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";

export async function ethersPregenSignHandler(req: Request, res: Response): Promise<void> {
  const PARA_API_KEY = process.env.PARA_API_KEY;
  const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
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

    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider as ethers.Provider);

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

    await paraEthersSigner.signTransaction(tx);

    res.status(200).json({
      success: true,
      message: "Transaction signed using Ethers + Para (pre-generated wallet)",
    });
  } catch (error) {
    console.error("Error in ethersPregenSignHandler:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to sign transaction",
    });
  }
}
