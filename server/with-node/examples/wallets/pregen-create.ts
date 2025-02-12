import type { Request, Response, NextFunction } from "express";
import { Para as ParaServer, Environment, WalletType, PregenIdentifierType } from "@getpara/server-sdk";
import { encrypt } from "../../utils/encryption-utils.js";
import { setKeyShareInDB } from "../../db/keySharesDB.js";

/**
 * Use this handler when you need to create a pre-generated Para wallet for a user and securely store their key share.
 *
 * Before using this handler, ensure that:
 * - You have `PARA_API_KEY` set in your environment.
 * - The user is identified by an `email` provided in the request body.
 *
 * Steps for developers:
 * 1. Use `email` from the request body to associate the pre-generated wallet with a specific user.
 * 2. Create the pre-generated wallet using the Para server SDK.
 * 3. Retrieve the user's key share from Para and encrypt it before storing in your database.
 * 4. Return the wallet address to confirm that the wallet has been created successfully.
 *
 * Note:
 * - This handler does not sign transactions. It only sets up a pre-generated wallet so you can sign transactions later.
 * - In production, implement proper authentication and handle errors and duplicates more gracefully.
 */
export async function createPregenWalletHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Use `email` from the request body to identify the user for whom you are creating a wallet.
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).send("Provide `email` in the request body to create a pre-generated wallet.");
      return;
    }

    // Ensure PARA_API_KEY is set, otherwise you cannot interact with Para.
    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Para client and check if a pre-generated wallet already exists for this email.
    // If it does, return a 409 to indicate a duplicate wallet scenario.
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

    // Create a new pre-generated EVM wallet associated with the user's email.
    // Use PregenIdentifierType.EMAIL to link the wallet to the provided email.
    const wallet = await para.createPregenWallet({
      type: WalletType.EVM,
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });
    if (!wallet) {
      res.status(500).send("Failed to create pre-generated wallet. Check your Para configuration and try again.");
      return;
    }

    // 3. Retrieve the user's key share from the Para client.
    // This key share, combined with Para's share, allows for MPC signing later.
    const keyShare = para.getUserShare();
    if (!keyShare) {
      res.status(500).send("Failed to retrieve user share from the Para client. Confirm wallet creation steps.");
      return;
    }

    // Encrypt the key share before storing in your database.
    // This ensures that even if your database is compromised, the key share remains protected.
    const encryptedKeyShare = encrypt(keyShare);
    await setKeyShareInDB(email, encryptedKeyShare);

    // 4. Return the created wallet address.
    // The developer can now use this wallet address in subsequent signing operations.
    res.status(201).json({
      message: "Pre-generated wallet created successfully.",
      address: wallet.address,
    });
  } catch (error) {
    console.error("Error creating pre-generated wallet:", error);
    next(error);
  }
}
