import type { Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { http, parseEther, parseGwei } from "viem";
import { sepolia } from "viem/chains";

export async function viemPregenSignHandler(req: Request, res: Response): Promise<void> {
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

    const viemParaAccount = createParaAccount(para);
    const viemClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    });

    const request = await viemClient.prepareTransactionRequest({
      account: viemParaAccount,
      to: viemParaAccount.address,
      value: parseEther("0.0001"),
      gas: BigInt(21000),
      maxFeePerGas: parseGwei("20"),
      maxPriorityFeePerGas: parseGwei("3"),
      chain: sepolia,
    });

    const signedTxRlp = await viemClient.signTransaction(request);

    console.log("Viem Pregen - Signed transaction RLP:", signedTxRlp);

    res.status(200).json({
      success: true,
      message: "Transaction signed using Viem + Para (pre-generated wallet)",
    });
  } catch (error) {
    console.error("Error in viemPregenSignHandler:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to sign transaction",
    });
  }
}
