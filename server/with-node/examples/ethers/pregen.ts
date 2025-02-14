import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";

/**
 * Use this handler when you need to sign a transaction using a pre-generated Para wallet integrated with Ethers.
 * This approach demonstrates how to leverage a pre-created MPC wallet (and its stored key share) within your code.
 *
 * Prerequisites:
 * - Before calling this handler, ensure the user's pre-generated wallet and key share have been created and stored
 *   (see `pregen-create.ts` for an example).
 * - Provide `email` in the request body to identify which pre-generated wallet and key share to use.
 *
 * Steps for developers:
 * 1. Use `email` from the request body to look up the user's pre-generated wallet and encrypted key share.
 * 2. Decrypt the key share and provide it to the Para client to enable MPC-based signing.
 * 3. Initialize the ParaEthersSigner with the Ethers provider and the MPC-enabled wallet.
 * 4. Construct a transaction and sign it using ParaEthersSigner, producing a fully signed transaction.
 *
 * Note:
 * - This example focuses on using a pre-generated wallet. For production use, add authentication,
 *   authorization, and better error handling.
 */
export async function ethersPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Use `email` from the request body to identify the user's pre-generated wallet and key share.
    if (!req.body.email) {
      res.status(400).send("Provide `email` in the request body to look up the pre-generated wallet.");
      return;
    }
    const email = req.body.email as string;

    // Ensure PARA_API_KEY is set in your environment.
    // Without this key, you cannot communicate with the Para service.
    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    // 2. Initialize the Para client and verify the existence of the pre-generated wallet for the given email.
    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email. Ask the user to create one first.");
      return;
    }

    // Retrieve the user's encrypted key share from your database.
    // This key share was generated during the wallet creation process and must be decrypted before use.
    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).send("Key share not found. Confirm that the wallet was properly initialized and stored.");
      return;
    }

    // Decrypt the key share and set it on the Para client.
    // This step enables MPC-based signing functionality for the user's wallet.
    const decryptedKeyShare = decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    // 3. Set up an Ethers provider.
    // Here we use a Sepolia RPC endpoint for demonstration, but you can switch to mainnet or another testnet as needed.
    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

    // Initialize the ParaEthersSigner with the Para client and the Ethers provider.
    // The MPC wallet managed by Para is now accessible via Ethers.js.
    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider);

    // Retrieve the MPC-managed wallet address.
    const address = await paraEthersSigner.getAddress();

    // 4. Construct a transaction.
    // In this example, we create a simple ETH transfer transaction. Adjust the parameters to suit your use case.
    const tx = {
      to: address,
      from: address,
      value: ethers.parseEther("0.001"),
      nonce: await ethersProvider.getTransactionCount(address),
      gasLimit: 21000,
      gasPrice: (await ethersProvider.getFeeData()).gasPrice,
    };

    // Sign the transaction using the ParaEthersSigner.
    // If this fails, ensure that the key share was decrypted correctly and that the wallet is accessible.
    const signedTx = await paraEthersSigner.signTransaction(tx);

    // Return the signed transaction. You can broadcast it using the provider if desired.
    // For example: await ethersProvider.broadcastTransaction(signedTx)
    res.status(200).json({
      message: "Transaction signed using Ethers + Para (pre-generated wallet).",
      signedTransaction: signedTx,
    });
  } catch (error) {
    console.error("Error in ethersPregenSignHandler:", error);
    next(error);
  }
}
