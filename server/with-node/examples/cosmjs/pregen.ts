import type { NextFunction, Request, Response } from "express";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { CapsuleProtoSigner } from "@usecapsule/cosmjs-v0-integration";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";

/**
 * Use this handler when you need to sign a Cosmos SDK transaction using a pre-generated Capsule wallet.
 * This approach demonstrates how to integrate Capsule with CosmJS for developers who have already set up
 * a pre-generated wallet and stored the corresponding key share.
 *
 * Prerequisites:
 * - Before calling this handler, ensure that the user's pre-generated wallet and key share are created and stored.
 *   See `pregen-create.ts` for an example of how to initialize and store a key share.
 * - Provide `email` in the request body so you can look up the user's pre-generated wallet and retrieve their key share.
 *
 * Steps for developers:
 * 1. Use `email` from the request body to identify and verify the user's pre-generated wallet.
 * 2. Retrieve the encrypted key share from your database and decrypt it.
 * 3. Set the decrypted key share on the Capsule client to enable MPC-based signing.
 * 4. Initialize `CapsuleProtoSigner` with the Capsule client and connect a `SigningStargateClient` to your chosen Cosmos endpoint.
 * 5. Construct and sign a simple `MsgSend` transaction using the now-integrated MPC signer.
 *
 * Note:
 * - This example focuses on demonstrating how to sign Cosmos transactions using a pre-generated Capsule wallet.
 * - Implement authentication, authorization, environment variable checks, and proper error handling as needed.
 */
export async function cosmjsPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Use `email` from the request body to identify the user's pre-generated wallet.
    // If `email` is missing, inform the developer to ensure the client includes it.
    const { email } = req.body as { email?: string };
    if (!email) {
      res
        .status(400)
        .send("Provide `email` in the request body. This is required to look up the pre-generated wallet.");
      return;
    }

    // Ensure CAPSULE_API_KEY is available before proceeding. Without it, you cannot interact with Capsule.
    const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
    if (!CAPSULE_API_KEY) {
      res.status(500).send("Set CAPSULE_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Capsule client with the BETA environment for demonstration.
    const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);

    // 3. Check if a pre-generated wallet exists for the given email. If not, instruct the developer that the user must create one first.
    const hasPregenWallet = await capsuleClient.hasPregenWallet(email);
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email. Instruct the user to create one first.");
      return;
    }

    // 4. Retrieve the user's encrypted key share from the database and decrypt it.
    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res
        .status(400)
        .send("Key share not found. Confirm that the wallet was properly initialized and the key share stored.");
      return;
    }

    const decryptedKeyShare = decrypt(keyShare);

    // 5. Set the decrypted key share on the Capsule client so that it can perform MPC-based signing on behalf of the user.
    await capsuleClient.setUserShare(decryptedKeyShare);

    // 6. Initialize the CapsuleProtoSigner to integrate with Cosmos transactions.
    // The second argument ("cosmos") sets the bech32 prefix for addresses.
    const capsuleProtoSigner = new CapsuleProtoSigner(capsuleClient, "cosmos");

    // Connect the `SigningStargateClient` to a Cosmos RPC endpoint. Replace this endpoint as needed.
    const stargateClient = await SigningStargateClient.connectWithSigner(
      "https://rpc-t.cosmos.nodestake.top",
      capsuleProtoSigner
    );

    // 7. Construct a `MsgSend` transaction. Update the recipient, amounts, and fee for your scenario.
    const toAddress = "cosmos1c4k24jzduc365kywrsvf5ujz4ya6mwymy8vq4q";
    const fromAddress = capsuleProtoSigner.address;
    const amount: Coin = {
      denom: "uatom",
      amount: "1000",
    };

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

    // 8. Sign the transaction using the pre-generated wallet backed by Capsule MPC.
    // If this fails, ensure the pre-generated wallet and key share setup is correct and that the wallet is accessible.
    const signResult = await stargateClient.sign(fromAddress, [demoTxMessage], fee, memo);

    // Return the signed transaction. The developer can broadcast this transaction to the Cosmos network as needed.
    res.status(200).json({
      message: "Transaction signed using CosmJS + Capsule (pre-generated wallet).",
      signResult,
    });
  } catch (error) {
    console.error("Error in cosmjsPregenSignHandler:", error);
    next(error);
  }
}
