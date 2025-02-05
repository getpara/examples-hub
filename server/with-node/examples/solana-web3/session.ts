import type { NextFunction, Request, Response } from "express";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { CapsuleSolanaWeb3Signer } from "@usecapsule/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Use this handler when you need to sign a Solana transaction using a session-based Capsule wallet.
 *
 * Before using this handler, ensure that:
 * - The user's session has already been created and exported on the client side.
 * - You include `session` in the request body to import the session-based wallet.
 *
 * Steps for developers:
 * 1. Use `session` from the request body to import the user's MPC-controlled wallet via Capsule.
 * 2. Initialize `CapsuleSolanaWeb3Signer` with a Solana connection to integrate MPC signing into Solana-Web3 workflows.
 * 3. Construct a transaction and sign it using the session-based wallet.
 *
 * Note:
 * - This example focuses on a session-based wallet. Add authentication, authorization, and robust error handling as needed.
 */
export async function solanaSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Use `session` from the request body to restore the user's session-based MPC wallet.
    const { session } = req.body as { session?: string };
    if (!session) {
      res
        .status(400)
        .send(
          "Provide `session` in the request body. This session should be previously exported from the client side."
        );
      return;
    }

    // Ensure CAPSULE_API_KEY is set. Without it, Capsule-related operations cannot proceed.
    const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
    if (!CAPSULE_API_KEY) {
      res.status(500).send("Set CAPSULE_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Capsule client and import the user's session.
    // This links the server-side Capsule client to the user's MPC-enabled Solana wallet.
    const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
    await capsuleClient.importSession(session);

    // Initialize the CapsuleSolanaWeb3Signer with a Solana connection.
    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new CapsuleSolanaWeb3Signer(capsuleClient, connection);

    // Ensure the signer has a sender address. If not, verify the session is correct and the wallet is accessible.
    if (!solanaSigner.sender) {
      res.status(500).send("Failed to retrieve the Solana sender address from the session-based wallet.");
      return;
    }

    // 3. Construct a sample transaction.
    // Here, we send a small amount of lamports back to the same address, but you can send to any valid Solana address.
    const demoTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: solanaSigner.sender,
        lamports: LAMPORTS_PER_SOL / 100,
      })
    );

    // Sign the transaction using the session-based MPC wallet integrated with Solana-Web3.
    const signatureResult = await solanaSigner.signTransaction(demoTx);

    res.status(200).json({
      message: "Transaction signed using Solana-Web3 + Capsule (session-based wallet).",
      signatureResult,
    });
  } catch (error) {
    console.error("Error in solanaSessionSignHandler:", error);
    next(error);
  }
}
