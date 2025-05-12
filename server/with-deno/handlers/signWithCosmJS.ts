import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { Handler } from "@std/http";

export const signWithCosmJS: Handler = async (req: Request): Promise<Response> => {
  try {
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required in the request body" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const paraApiKey = Deno.env.get("PARA_API_KEY");
    const envString = Deno.env.get("PARA_ENVIRONMENT") || "BETA";
    const env = envString as Environment;

    if (!paraApiKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const para = new ParaServer(env, paraApiKey, { disableWebSockets: true });

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });

    if (!hasPregenWallet) {
      return new Response(JSON.stringify({ error: `Pregenerated wallet does not exist for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const keyShare = await getKeyShareInDB(email);

    if (!keyShare) {
      return new Response(JSON.stringify({ error: `Key share not found in DB for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const paraProtoSigner = new ParaProtoSigner(para, "cosmos");

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

    return new Response(JSON.stringify({ route: "signWithCosmJS", signResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};
