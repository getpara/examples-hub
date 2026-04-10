import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { createParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { Handler } from "@std/http";

// Environment variables
const PARA_API_KEY = Deno.env.get("PARA_API_KEY");
const PARA_ENVIRONMENT = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;

export const signWithCosmJS: Handler = async (req: Request): Promise<Response> => {
  try {
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: "Email is required in the request body" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!PARA_API_KEY) {
      return new Response(JSON.stringify({ success: false, message: "PARA_API_KEY is not set" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });

    if (!hasPregenWallet) {
      return new Response(JSON.stringify({ success: false, message: `No pre-generated wallet found for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const keyShare = await getKeyShareInDB(email);

    if (!keyShare) {
      return new Response(JSON.stringify({ success: false, message: `Key share not found in DB for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const paraProtoSigner = createParaProtoSigner({ para, prefix: "cosmos" });

    const stargateClient = await SigningStargateClient.connectWithSigner(
      "https://cosmoshub-testnet.rpc.kjnodes.com/",
      paraProtoSigner
    );

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

    const message: MsgSend = {
      fromAddress,
      toAddress: fromAddress,
      amount: [amount],
    };

    const demoTxMessage: MsgSendEncodeObject = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: message,
    };

    const signResult = await stargateClient.sign(fromAddress, [demoTxMessage], fee, memo);

    console.log("CosmJS Pregen - Signed transaction:", signResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Transaction signed using CosmJS + Para (pre-generated wallet)" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in signWithCosmJS:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Failed to sign transaction",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};
