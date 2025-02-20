import type { Request, Response, NextFunction } from "express";
import { Para as ParaServer, Environment, WalletType, PregenIdentifierType } from "@getpara/server-sdk";
import { encrypt } from "../../utils/encryption-utils.js";
import { setKeyShareInDB } from "../../db/keySharesDB.js";

export async function createPregenWalletHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).send("Provide `email` in the request body to create a pre-generated wallet.");
      return;
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    const walletExists = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (walletExists) {
      res
        .status(409)
        .send(
          "A pre-generated wallet already exists for this user. Consider using that wallet or choose a different email."
        );
      return;
    }

    const wallet = await para.createPregenWallet({
      type: WalletType.EVM,
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });
    if (!wallet) {
      res.status(500).send("Failed to create pre-generated wallet. Check your Para configuration and try again.");
      return;
    }

    const keyShare = para.getUserShare();
    if (!keyShare) {
      res.status(500).send("Failed to retrieve user share from the Para client. Confirm wallet creation steps.");
      return;
    }

    const encryptedKeyShare = encrypt(keyShare);
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
