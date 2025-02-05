// File: examples/viem/session.ts

import type { NextFunction, Request, Response } from "express";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { createCapsuleAccount, createCapsuleViemClient } from "@usecapsule/viem-v2-integration";
import { http, parseEther, parseGwei } from "viem";
import { sepolia } from "viem/chains";

/**
 * Use this handler when you need to sign an Ethereum transaction using a session-based Capsule wallet integrated with Viem.
 *
 * Before using this handler, ensure that:
 * - The user's session has already been created and exported on the client side.
 * - You include `session` in the request body to import the session-based wallet.
 *
 * Steps for developers:
 * 1. Use `session` from the request body to import the user's MPC-controlled wallet via Capsule.
 * 2. Initialize a Viem WalletClient using `createCapsuleAccount` and `createCapsuleViemClient`.
 * 3. Prepare and sign a transaction using the Viem client, leveraging the session-based wallet.
 *
 * Note:
 * - This example focuses on a session-based wallet. Add authentication, authorization, and error handling as needed.
 */
export async function viemSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Use `session` from the request body to restore the user's session-based wallet.
    const { session } = req.body as { session?: string };
    if (!session) {
      res
        .status(400)
        .send(
          "Provide `session` in the request body. This session should be previously exported from the client side."
        );
      return;
    }

    // Ensure CAPSULE_API_KEY is set. Without it, you cannot interact with Capsule.
    const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
    if (!CAPSULE_API_KEY) {
      res.status(500).send("Set CAPSULE_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Capsule client and import the user's session.
    const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
    await capsuleClient.importSession(session);

    // Initialize a Viem account and WalletClient using the session-based MPC wallet.
    const viemCapsuleAccount = createCapsuleAccount(capsuleClient);
    const viemClient = createCapsuleViemClient(capsuleClient, {
      account: viemCapsuleAccount,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    });

    // 3. Prepare and sign a sample ETH transfer transaction.
    // Adjust the parameters as needed for your use case.
    const request = await viemClient.prepareTransactionRequest({
      account: viemCapsuleAccount,
      to: viemCapsuleAccount.address,
      value: parseEther("0.001"),
      gas: 21000n,
      maxFeePerGas: parseGwei("20"),
      maxPriorityFeePerGas: parseGwei("3"),
      chain: sepolia,
    });

    const signatureResult = await viemClient.signTransaction(request);

    // Return the signed transaction for inspection or broadcasting.
    res.status(200).json({
      message: "Transaction signed using Viem + Capsule (session-based wallet).",
      signatureResult,
    });
  } catch (error) {
    console.error("Error in viemSessionSignHandler:", error);
    next(error);
  }
}
