import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";

export const signWithCosmJS = async (req: Request): Promise<Response> => {
  const { email }: { email: string } = await req.json();

  if (!email) {
    return new Response("Email is required in the request body", { status: 400 });
  }

  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    console.error("Server configuration error: PARA_API_KEY not set");
    return new Response("Server configuration error", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY, { disableWebSockets: true, disableWorkers: true });

  try {
    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      return new Response(`Pregenerated wallet does not exist for ${email}`, { status: 404 });
    }

    const keyShare = getKeyShareInDB(email);
    if (!keyShare) {
      return new Response(`Key share not found in DB for ${email}`, { status: 404 });
    }

    let decryptedKeyShare: string;

    try {
      decryptedKeyShare = await decrypt(keyShare);
    } catch (decryptionError) {
      console.error(`Failed to decrypt key share for ${email}:`, decryptionError);
      return new Response("Failed to process key share", { status: 500 });
    }

    await para.setUserShare(decryptedKeyShare);

    if (!para.wallets || Object.keys(para.wallets).length === 0) {
      throw new Error("Failed to load wallet details after setting user share.");
    }

    const paraProtoSigner = new ParaProtoSigner(para, "cosmos");

    const fromAddress = paraProtoSigner.address;

    if (!fromAddress) {
      throw new Error("Failed to get address from ParaProtoSigner.");
    }

    const stargateClient = await SigningStargateClient.connectWithSigner(
      "https://rpc-t.cosmos.nodestake.top",
      paraProtoSigner
    );

    const toAddress = "cosmos1c4k24jzduc365kywrsvf5ujz4ya6mwymy8vq4q";

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

    const signResult = await stargateClient.sign(fromAddress, [demoTxMessage], fee, memo);

    return new Response(JSON.stringify({ route: "signWithCosmJS", signResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error during signWithCosmJS process for ${email}:`, error);
    return new Response(`Failed to sign with CosmJS: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
