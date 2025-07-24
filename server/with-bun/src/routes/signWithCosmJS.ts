import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";

const PARA_API_KEY = Bun.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

export const signWithCosmJS = async (req: Request): Promise<Response> => {
  try {
    if (!PARA_API_KEY) {
      return Response.json({
        success: false,
        message: "Missing required environment variables",
      }, { status: 500 });
    }

    const body = await req.json();
    const email = body.email as string | undefined;

    if (!email) {
      return Response.json({
        success: false,
        message: "Missing email in request body",
      }, { status: 400 });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });
    if (!hasPregenWallet) {
      return Response.json({
        success: false,
        message: "No pre-generated wallet found for this email",
      }, { status: 400 });
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      return Response.json({
        success: false,
        message: "Key share not found for this email",
      }, { status: 400 });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const paraProtoSigner = new ParaProtoSigner(para, "cosmos");

    const stargateClient = await SigningStargateClient.connectWithSigner(
      "https://rpc-t.cosmos.nodestake.top",
      paraProtoSigner
    );

    const toAddress = "cosmos1c4k24jzduc365kywrsvf5ujz4ya6mwymy8vq4q";
    const fromAddress = paraProtoSigner.address;
    const amount: Coin = {
      denom: "uatom",
      amount: "1000",
    };
    const fee: StdFee = {
      amount: [{ denom: "uatom", amount: "500" }],
      gas: "200000",
    };
    const memo = "Signed with Para";

    const message = {
      fromAddress,
      toAddress,
      amount: [amount],
    };

    const demoTxMessage: MsgSendEncodeObject = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: message,
    };

    const signResult = await stargateClient.sign(fromAddress, [demoTxMessage], fee, memo);

    console.log("CosmJS Pregen - Transaction sign result:", signResult);

    return Response.json({
      success: true,
      message: "Transaction signed successfully using CosmJS + Para with pre-generated wallet",
    });
  } catch (error) {
    console.error("CosmJS pregen transaction error:", error);
    return Response.json({
      success: false,
      message: "Transaction failed",
    }, { status: 500 });
  }
};
