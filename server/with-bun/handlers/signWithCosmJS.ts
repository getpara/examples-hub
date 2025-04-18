import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";

export const signWithCosmJS = async (req: Request): Promise<Response> => {
  try {
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response("Email is required in the request body", { status: 400 });
    }

    const paraApiKey = Bun.env.PARA_API_KEY;

    if (!paraApiKey) {
      return new Response("Server configuration error", { status: 500 });
    }

    const para = new ParaServer(Environment.BETA, paraApiKey, { disableWebSockets: true });

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      return new Response(`Pregenerated wallet does not exist for ${email}`, { status: 404 });
    }

    const keyShare = await getKeyShareInDB(email);

    if (!keyShare) {
      return new Response(`Key share not found in DB for ${email}`, { status: 404 });
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

    const message: MsgSend = {
      fromAddress,
      toAddress,
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
    return new Response(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
