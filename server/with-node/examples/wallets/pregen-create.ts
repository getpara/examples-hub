import type { Request, Response, NextFunction } from "express";
import { Capsule as CapsuleServer, Environment, WalletType, PregenIdentifierType } from "@usecapsule/server-sdk";
import { encrypt } from "../../utils/encryption-utils.js";
import { setKeyShareInDB } from "../../db/keySharesDB.js";

/**
 * Use this handler when you need to create a pre-generated Capsule wallet for a user and securely store their key share.
 *
 * Before using this handler, ensure that:
 * - You have `CAPSULE_API_KEY` set in your environment.
 * - The user is identified by an `email` provided in the request body.
 *
 * Steps for developers:
 * 1. Use `email` from the request body to associate the pre-generated wallet with a specific user.
 * 2. Create the pre-generated wallet using the Capsule server SDK.
 * 3. Retrieve the user's key share from Capsule and encrypt it before storing in your database.
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

    // Ensure CAPSULE_API_KEY is set, otherwise you cannot interact with Capsule.
    const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
    if (!CAPSULE_API_KEY) {
      res.status(500).send("Set CAPSULE_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Capsule client and check if a pre-generated wallet already exists for this email.
    // If it does, return a 409 to indicate a duplicate wallet scenario.
    const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
    const walletExists = await capsuleClient.hasPregenWallet(email);
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
    const wallet = await capsuleClient.createWalletPreGen(WalletType.EVM, email, PregenIdentifierType.EMAIL);
    if (!wallet) {
      res.status(500).send("Failed to create pre-generated wallet. Check your Capsule configuration and try again.");
      return;
    }

    // 3. Retrieve the user's key share from the Capsule client.
    // This key share, combined with Capsule's share, allows for MPC signing later.
    const keyShare = capsuleClient.getUserShare();
    if (!keyShare) {
      res.status(500).send("Failed to retrieve user share from the Capsule client. Confirm wallet creation steps.");
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
