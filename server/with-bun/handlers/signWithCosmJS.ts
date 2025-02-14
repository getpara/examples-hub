import { simulateVerifyToken } from "../utils/auth-utils";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";

/**
 * Handles signing with CosmJS and Para ProtoSigner.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response containing the signed transaction result.
 */
export const signWithCosmJS = async (req: Request): Promise<Response> => {
  // Validate Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use your own token verification logic here
  const token = authHeader.split(" ")[1];
  const user = simulateVerifyToken(token);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Parse and validate request body
  const { email }: RequestBody = await req.json();
  if (user.email !== email) {
    return new Response("Forbidden", { status: 403 });
  }

  // Ensure PARA_API_KEY is available
  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    return new Response("PARA_API_KEY not set", { status: 500 });
  }

  // Initialize Para client and check if wallet exists
  const para = new ParaServer(Environment.BETA, PARA_API_KEY);
  const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });

  if (!hasPregenWallet) {
    return new Response("Wallet does not exist", { status: 400 });
  }

  // Retrieve and decrypt key share
  const keyShare = getKeyShareInDB(email);
  if (!keyShare) {
    return new Response("Key share does not exist", { status: 400 });
  }

  const decryptedKeyShare = decrypt(keyShare);
  await para.setUserShare(decryptedKeyShare);

  // Initialize Para ProtoSigner and Stargate client
  const paraProtoSigner = new ParaProtoSigner(para, "cosmos");
  const stargateClient = await SigningStargateClient.connectWithSigner(
    "https://rpc-t.cosmos.nodestake.top",
    paraProtoSigner
  );

  // Prepare transaction details
  const toAddress = "cosmos1c4k24jzduc365kywrsvf5ujz4ya6mwymy8vq4q"; // Replace with the actual recipient address
  const fromAddress = paraProtoSigner.address;

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

  const memo = "Signed with Para";

  // Sign the transaction. Internally this will use the Para ProtoSigner.
  const signResult = await stargateClient.sign(fromAddress, [demoTxMessage], fee, memo);

  // Return the result
  return new Response(JSON.stringify({ route: "signWithCosmJS", signResult }), { status: 200 });
};
