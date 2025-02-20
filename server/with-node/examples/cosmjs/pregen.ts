import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";

export async function cosmjsPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res
        .status(400)
        .send("Provide `email` in the request body. This is required to look up the pre-generated wallet.");
      return;
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email. Instruct the user to create one first.");
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res
        .status(400)
        .send("Key share not found. Confirm that the wallet was properly initialized and the key share stored.");
      return;
    }

    const decryptedKeyShare = decrypt(keyShare);

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

    res.status(200).json({
      message: "Transaction signed using CosmJS + Para (pre-generated wallet).",
      signResult,
    });
  } catch (error) {
    console.error("Error in cosmjsPregenSignHandler:", error);
    next(error);
  }
}
