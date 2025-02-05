import type { NextFunction, Request, Response } from "express";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { createCapsuleAccount, createCapsuleViemClient } from "@usecapsule/viem-v2-integration";
import { http, parseEther, parseGwei } from "viem";
import { sepolia } from "viem/chains";

/**
 * Use this handler when you need to sign an Ethereum transaction using a pre-generated Capsule wallet, integrated with Viem.
 *
 * Before using this handler, ensure that:
 * - The user's pre-generated wallet and key share have been created and stored (see `pregen-create.ts`).
 * - You include `email` in the request body to identify the correct pre-generated wallet.
 *
 * Steps for developers:
 * 1. Use `email` from the request body to look up the user's pre-generated wallet and encrypted key share.
 * 2. Decrypt the key share and set it on the Capsule client to enable MPC-based signing.
 * 3. Initialize a Viem WalletClient using `createCapsuleAccount` and `createCapsuleViemClient` with the Capsule client.
 * 4. Prepare a transaction and sign it using the Viem client.
 *
 * Note:
 * - This example focuses on a pre-generated wallet. For production use, add authentication, authorization, and robust error handling.
 */
export async function viemPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Use `email` from the request body to identify the user's pre-generated wallet.
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).send("Provide `email` in the request body to identify the pre-generated wallet.");
      return;
    }

    // Ensure CAPSULE_API_KEY is set in the environment to interact with the Capsule service.
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

    // Retrieve the user's encrypted key share from the database and decrypt it.
    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).send("Key share not found. Confirm that the wallet was properly initialized and stored.");
      return;
    }

    const decryptedKeyShare = decrypt(keyShare);
    await capsuleClient.setUserShare(decryptedKeyShare);

    // 3. Initialize a Viem account and WalletClient backed by the Capsule client.
    // This integrates MPC signing into Viem's workflow.
    const viemCapsuleAccount = createCapsuleAccount(capsuleClient);
    const viemClient = createCapsuleViemClient(capsuleClient, {
      account: viemCapsuleAccount,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    });

    // 4. Prepare and sign a simple ETH transfer transaction.
    // Adjust the parameters as needed for your scenario.
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

    // Return the signed transaction so you can inspect or broadcast it.
    res.status(200).json({
      message: "Transaction signed using Viem + Capsule (pre-generated wallet).",
      signatureResult,
    });
  } catch (error) {
    console.error("Error in viemPregenSignHandler:", error);
    next(error);
  }
}
