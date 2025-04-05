import type { Request, Response, NextFunction } from "express";
import { Para as ParaServer, Environment, WalletType } from "@getpara/server-sdk";
import { encrypt } from "../../utils/encryption-utils.js";
import { setKeyShareInDB } from "../../db/keySharesDB.js";

export async function createPregenWalletHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const walletExists = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });

    if (walletExists) {
      res.status(409).send("A pre-generated wallet already exists for this email.");
      return;
    }

    const wallet = await para.createPregenWallet({
      type: WalletType.EVM,
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });

    if (!wallet) {
      res.status(500).send("Failed to create pre-generated wallet instance.");
      return;
    }

    const keyShare = para.getUserShare();
    if (!keyShare) {
      res.status(500).send("Failed to retrieve user share after wallet creation.");
      return;
    }

    const encryptedKeyShare = await encrypt(keyShare);
    await setKeyShareInDB(email, encryptedKeyShare);

    res.status(201).json({
      message: "Pre-generated wallet created successfully.",
      address: wallet.address,
    });
  } catch (error) {
    console.error("Error creating pre-generated wallet:", error);
    next(error);
  }
}
