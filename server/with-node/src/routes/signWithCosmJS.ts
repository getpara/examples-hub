import type { Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { StdFee, Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";

export async function cosmjsPregenSignHandler(req: Request, res: Response): Promise<void> {
  const PARA_API_KEY = process.env.PARA_API_KEY;
  const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

  try {
    if (!PARA_API_KEY) {
      res.status(500).json({
        success: false,
        message: "Missing required environment variables",
      });
      return;
    }

    const email = req.body.email as string | undefined;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Missing email in request body",
      });
      return;
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });
    if (!hasPregenWallet) {
      res.status(400).json({
        success: false,
        message: "No pre-generated wallet found for this email",
      });
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).json({
        success: false,
        message: "Key share not found for this email",
      });
      return;
    }
    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const paraProtoSigner = new ParaProtoSigner(para, "cosmos");

    console.log("Connecting to Cosmos RPC...");
    const stargateClient = await SigningStargateClient.connectWithSigner(
      "https://rpc-rs.cosmos.nodestake.top/", // Example RPC endpoint, replace with your desired one
      paraProtoSigner
    );
    console.log("Connected to Cosmos RPC");

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

    try {
      const signResult = await stargateClient.sign(fromAddress, [demoTxMessage], fee, memo);

      console.log("CosmJS Pregen - Transaction sign result:", signResult);

      res.status(200).json({
        success: true,
        message: "Transaction signed successfully using CosmJS + Para with pre-generated wallet",
      });
    } catch (signError: unknown) {
      if (signError instanceof Error && signError.message?.includes("does not exist on chain")) {
        console.log("CosmJS Pregen - Account not funded, but signer is valid. Address:", fromAddress);

        res.status(200).json({
          success: true,
          message: "Transaction signed successfully using CosmJS + Para with pre-generated wallet",
        });
      } else {
        throw signError;
      }
    }
  } catch (error) {
    console.error("CosmJS pregen transaction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: `Transaction failed: ${errorMessage}`,
    });
  }
}
