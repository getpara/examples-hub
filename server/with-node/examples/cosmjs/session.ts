import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";

/**
 * Use this handler when you want to sign a Cosmos SDK transaction using a session-based Para wallet.
 * This approach integrates Para's MPC-based signing into the CosmJS workflow without requiring the developer
 * to manage private keys directly.
 *
 * Prerequisites:
 * - Ensure that the user's Para session has already been created and exported on the client side.
 * - Provide `session` in the request body to import the user's session into this server-side Para client.
 *
 * Steps for developers:
 * 1. Use `session` from the request body to import the user's existing Para-based Cosmos wallet session.
 * 2. Initialize `ParaProtoSigner` with the Para client to enable MPC signing for Cosmos transactions.
 * 3. Connect the `SigningStargateClient` to a Cosmos RPC endpoint using the `ParaProtoSigner`.
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

    // Ensure that the PARA_API_KEY is available. Without it, you cannot interact with the Para service.
    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Para client with the BETA environment and import the user's session.
    // This ties the server-side Para client to a wallet controlled by the user's session data.
    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    await para.importSession(session);

    // 3. Initialize the Para ProtoSigner for Cosmos. This signer integrates directly with CosmJS,
    //    enabling MPC-based signing through the Para client without exposing the private key material.
    const paraProtoSigner = new ParaProtoSigner(para, "cosmos");

    // Connect to a Cosmos RPC endpoint. Replace the provided endpoint with a suitable testnet or mainnet endpoint.
    // Using `connectWithSigner` allows you to sign transactions with ParaProtoSigner.
    const stargateClient = await SigningStargateClient.connectWithSigner(
      "https://rpc-t.cosmos.nodestake.top",
      paraProtoSigner
    );

    // 4. Construct a `MsgSend` transaction. Adjust recipient, amounts, and fees as needed.
    // In this example, we are sending a small amount of uatom to a sample address.
    const toAddress = "cosmos1c4k24jzduc365kywrsvf5ujz4ya6mwymy8vq4q";
    const fromAddress = paraProtoSigner.address; // The user's address is derived from the session-based wallet.
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

    const memo = "Signed with Para";

    // 5. Sign the transaction using the session-based wallet. The `stargateClient.sign()` method uses the MPC-backed signer
    //    provided by Para. If this step fails, ensure the session is valid and has the correct permissions.
    const signResult = await stargateClient.sign(fromAddress, [demoTxMessage], fee, memo);

    // Return the signed transaction to the developer. They can broadcast this to the Cosmos network as needed.
    res.status(200).json({
      message: "Transaction signed using CosmJS + Para (session-based wallet).",
      signResult,
    });
  } catch (error) {
    console.error("Error in cosmjsSessionSignHandler:", error);
    next(error);
  }
}
