import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Use this handler when you need to sign a Solana transaction using a pre-generated Para wallet.
 *
 * Before using this handler, ensure that:
 * - The user's pre-generated wallet and key share are created and stored (see `pregen-create.ts`).
 * - You include `email` in the request body to identify the correct pre-generated wallet.
 *
 * Steps for developers:
 * 1. Use `email` from the request body to look up the user's pre-generated wallet and encrypted key share.
 * 2. Decrypt the key share and set it on the Para client to enable MPC-based signing.
 * 3. Initialize the `ParaSolanaWeb3Signer` with a Solana connection, integrating Para's MPC signing into Solana-Web3 workflows.
 * 4. Construct a transaction and sign it using the ParaSolanaWeb3Signer.
 *
 * Note:
 * - This example focuses on using a pre-generated wallet with Solana via Para.
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

    // Ensure PARA_API_KEY is set. Without it, Para operations cannot proceed.
    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Para client and verify that a pre-generated wallet exists for the given email.
    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
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
    await para.setUserShare(decryptedKeyShare);

    // 3. Create a Solana connection and initialize the ParaSolanaWeb3Signer.
    // This allows you to sign Solana transactions using the MPC-controlled wallet.
    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

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

    // Sign the transaction using the MPC-enabled wallet via ParaSolanaWeb3Signer.
    const signatureResult = await solanaSigner.signTransaction(demoTx);

    res.status(200).json({
      message: "Transaction signed using Solana-Web3 + Para (pre-generated wallet).",
      signatureResult,
    });
  } catch (error) {
    console.error("Error in solanaPregenSignHandler:", error);
    next(error);
  }
}
