import type { NextFunction, Request, Response } from "express";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { CapsuleSolanaWeb3Signer } from "@usecapsule/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Use this handler when you need to sign a Solana transaction using a pre-generated Capsule wallet.
 *
 * Before using this handler, ensure that:
 * - The user's pre-generated wallet and key share are created and stored (see `pregen-create.ts`).
 * - You include `email` in the request body to identify the correct pre-generated wallet.
 *
 * Steps for developers:
 * 1. Use `email` from the request body to look up the user's pre-generated wallet and encrypted key share.
 * 2. Decrypt the key share and set it on the Capsule client to enable MPC-based signing.
 * 3. Initialize the `CapsuleSolanaWeb3Signer` with a Solana connection, integrating Capsule's MPC signing into Solana-Web3 workflows.
 * 4. Construct a transaction and sign it using the CapsuleSolanaWeb3Signer.
 *
 * Note:
 * - This example focuses on using a pre-generated wallet with Solana via Capsule.
 * - Implement proper authentication, authorization, and error handling for production scenarios.
 */
export async function solanaPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Use `email` from the request body to identify the user's pre-generated wallet.
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).send("Provide `email` in the request body to identify the pre-generated wallet.");
      return;
    }

    // Ensure CAPSULE_API_KEY is set. Without it, Capsule operations cannot proceed.
    const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
    if (!CAPSULE_API_KEY) {
      res.status(500).send("Set CAPSULE_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Capsule client and verify that a pre-generated wallet exists for the given email.
    const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
    const hasPregenWallet = await capsuleClient.hasPregenWallet(email);
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email. Have the user create one first.");
      return;
    }

    // Retrieve the encrypted key share from the database and decrypt it.
    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).send("Key share not found. Confirm that the wallet was properly initialized.");
      return;
    }

    const decryptedKeyShare = decrypt(keyShare);
    await capsuleClient.setUserShare(decryptedKeyShare);

    // 3. Create a Solana connection and initialize the CapsuleSolanaWeb3Signer.
    // This allows you to sign Solana transactions using the MPC-controlled wallet.
    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new CapsuleSolanaWeb3Signer(capsuleClient, connection);

    // Ensure the signer has a sender address. If this fails, check that the wallet and key share are correct.
    if (!solanaSigner.sender) {
      res.status(500).send("Failed to retrieve the Solana sender address from the pre-generated wallet.");
      return;
    }

    // 4. Construct a sample transaction.
    // In this example, we send a small amount of lamports from the user's address back to itself.
    // Adjust the recipient and amount as needed for your use case.
    const demoTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: solanaSigner.sender,
        lamports: LAMPORTS_PER_SOL / 100,
      })
    );

    // Sign the transaction using the MPC-enabled wallet via CapsuleSolanaWeb3Signer.
    const signatureResult = await solanaSigner.signTransaction(demoTx);

    res.status(200).json({
      message: "Transaction signed using Solana-Web3 + Capsule (pre-generated wallet).",
      signatureResult,
    });
  } catch (error) {
    console.error("Error in solanaPregenSignHandler:", error);
    next(error);
  }
}
