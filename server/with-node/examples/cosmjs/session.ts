import type { NextFunction, Request, Response } from "express";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { CapsuleProtoSigner } from "@usecapsule/cosmjs-v0-integration";

/**
 * Use this handler when you want to sign a Cosmos SDK transaction using a session-based Capsule wallet.
 * This approach integrates Capsule's MPC-based signing into the CosmJS workflow without requiring the developer
 * to manage private keys directly.
 *
 * Prerequisites:
 * - Ensure that the user's Capsule session has already been created and exported on the client side.
 * - Provide `session` in the request body to import the user's session into this server-side Capsule client.
 *
 * Steps for developers:
 * 1. Use `session` from the request body to import the user's existing Capsule-based Cosmos wallet session.
 * 2. Initialize `CapsuleProtoSigner` with the Capsule client to enable MPC signing for Cosmos transactions.
 * 3. Connect the `SigningStargateClient` to a Cosmos RPC endpoint using the `CapsuleProtoSigner`.
 * 4. Construct a simple `MsgSend` transaction and sign it using the `stargateClient.sign()` method.
 *
 * Note:
 * - This example focuses on session-based signing with Cosmos networks.
 * - Implement proper authentication, authorization, and error handling in a production environment.
 */
export async function cosmjsSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Use `session` from the request body to restore the user's session-based wallet.
    // If `session` is missing, inform the developer to ensure the client includes it.
    const { session } = req.body as { session?: string };
    if (!session) {
      res
        .status(400)
        .send(
          "Provide `session` in the request body. This session should be previously exported from the client side."
        );
      return;
    }

    // Ensure that the CAPSULE_API_KEY is available. Without it, you cannot interact with the Capsule service.
    const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
    if (!CAPSULE_API_KEY) {
      res.status(500).send("Set CAPSULE_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Capsule client with the BETA environment and import the user's session.
    // This ties the server-side Capsule client to a wallet controlled by the user's session data.
    const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
    await capsuleClient.importSession(session);

    // 3. Initialize the Capsule ProtoSigner for Cosmos. This signer integrates directly with CosmJS,
    //    enabling MPC-based signing through the Capsule client without exposing the private key material.
    const capsuleProtoSigner = new CapsuleProtoSigner(capsuleClient, "cosmos");

    // Connect to a Cosmos RPC endpoint. Replace the provided endpoint with a suitable testnet or mainnet endpoint.
    // Using `connectWithSigner` allows you to sign transactions with CapsuleProtoSigner.
    const stargateClient = await SigningStargateClient.connectWithSigner(
      "https://rpc-t.cosmos.nodestake.top",
      capsuleProtoSigner
    );

    // 4. Construct a `MsgSend` transaction. Adjust recipient, amounts, and fees as needed.
    // In this example, we are sending a small amount of uatom to a sample address.
    const toAddress = "cosmos1c4k24jzduc365kywrsvf5ujz4ya6mwymy8vq4q";
    const fromAddress = capsuleProtoSigner.address; // The user's address is derived from the session-based wallet.
    const amount: Coin = {
      denom: "uatom",
      amount: "1000",
    };

    // Define the transaction fee. Adjust the fee and gas to appropriate values for your target network.
    const fee: StdFee = {
      amount: [{ denom: "uatom", amount: "500" }],
      gas: "200000",
    };

    const message: MsgSend = {
      fromAddress,
      toAddress,
      amount: [amount],
    };

    const demoTxMessage: MsgSendEncodeObject = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: message,
    };

    const memo = "Signed with Capsule";

    // 5. Sign the transaction using the session-based wallet. The `stargateClient.sign()` method uses the MPC-backed signer
    //    provided by Capsule. If this step fails, ensure the session is valid and has the correct permissions.
    const signResult = await stargateClient.sign(fromAddress, [demoTxMessage], fee, memo);

    // Return the signed transaction to the developer. They can broadcast this to the Cosmos network as needed.
    res.status(200).json({
      message: "Transaction signed using CosmJS + Capsule (session-based wallet).",
      signResult,
    });
  } catch (error) {
    console.error("Error in cosmjsSessionSignHandler:", error);
    next(error);
  }
}
