import type { Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { encrypt } from "../utils/encryption-utils.js";
import { setKeyShareInDB } from "../db/keySharesDB.js";

export async function createPregenWalletHandler(req: Request, res: Response): Promise<void> {
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

    const walletExists = await para.hasPregenWallet({ pregenId: { email } });

    if (walletExists) {
      res.status(409).json({ success: false, message: "A pre-generated wallet already exists for this email" });
      return;
    }

    const wallets = await para.createPregenWalletPerType({
      types: ["EVM", "SOLANA", "COSMOS"],
      pregenId: { email },
    });

    if (!wallets) {
      res.status(500).json({ success: false, message: "Failed to create pre-generated wallet instance" });
      return;
    }

    const keyShare = para.getUserShare();
    if (!keyShare) {
      res.status(500).json({ success: false, message: "Failed to retrieve user share after wallet creation" });
      return;
    }

    const encryptedKeyShare = await encrypt(keyShare);
    await setKeyShareInDB(email, encryptedKeyShare);

    res.status(201).json({
      success: true,
      message: "Pre-generated wallets created successfully",
    });
  } catch (error) {
    console.error("Error creating pre-generated wallet:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create pre-generated wallet",
    });
  }
}
