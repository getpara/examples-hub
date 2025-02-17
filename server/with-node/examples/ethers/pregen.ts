import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";

export async function ethersPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.body.email) {
      res.status(400).send("Provide `email` in the request body to look up the pre-generated wallet.");
      return;
    }
    const email = req.body.email as string;

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email. Ask the user to create one first.");
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).send("Key share not found. Confirm that the wallet was properly initialized and stored.");
      return;
    }

    const decryptedKeyShare = decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider);

    const address = await paraEthersSigner.getAddress();

    const tx = {
      to: address,
      from: address,
      value: ethers.parseEther("0.001"),
      nonce: await ethersProvider.getTransactionCount(address),
      gasLimit: 21000,
      gasPrice: (await ethersProvider.getFeeData()).gasPrice,
    };

    const signedTx = await paraEthersSigner.signTransaction(tx);

    res.status(200).json({
      message: "Transaction signed using Ethers + Para (pre-generated wallet).",
      signedTransaction: signedTx,
    });
  } catch (error) {
    console.error("Error in ethersPregenSignHandler:", error);
    next(error);
  }
}
