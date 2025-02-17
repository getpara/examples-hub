import type { Request, Response, NextFunction } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { RLP } from "@ethereumjs/rlp";

export async function paraPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).send("Include `email` in the request body. This email should map to a pre-generated wallet.");
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
      res.status(400).send("No pre-generated wallet found for this email. Have the user create one first.");
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

    const wallets = await para.getWallets();
    const wallet = Object.values(wallets)[0];
    if (!wallet) {
      res
        .status(500)
        .send("No wallet found after setting the user share. Confirm that the pre-generated wallet is available.");
      return;
    }

    const walletId = wallet.id;
    const walletAddress = wallet.address;

    const demoRawTx = {
      nonce: "0x00",
      gasPrice: "0x09184e72a000",
      gasLimit: "0x2710",
      to: walletAddress,
      from: walletAddress,
      value: "0x00",
      data: "0x",
    };

    const rlpEncodedTx = RLP.encode([
      demoRawTx.nonce,
      demoRawTx.gasPrice,
      demoRawTx.gasLimit,
      demoRawTx.to,
      demoRawTx.from,
      demoRawTx.value,
      demoRawTx.data,
    ]);

    const rlpEncodedTxBase64 = Buffer.from(rlpEncodedTx).toString("base64");

    const signTransactionResult = await para.signTransaction({ walletId, rlpEncodedTxBase64, chainId: "11155111" });

    res.status(200).json({
      message: "Successfully signed the transaction using the pre-generated Para wallet.",
      signTransactionResult,
    });
  } catch (error) {
    console.error("Error in paraPregenSignHandler:", error);
    next(error);
  }
}
