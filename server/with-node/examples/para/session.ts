import type { Request, Response, NextFunction } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { RLP } from "@ethereumjs/rlp";

export async function paraSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { session } = req.body as { session?: string };
    if (!session) {
      res
        .status(400)
        .send("Include `session` in the request body. This session must be previously exported from the client.");
      return;
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    await para.importSession(session);

    const wallets = await para.getWallets();
    const wallet = Object.values(wallets)[0];
    if (!wallet) {
      res
        .status(500)
        .send("No wallet found after importing the session. Confirm that the session is valid and contains a wallet.");
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

    const signTransactionResult = await para.signTransaction({
      walletId,
      rlpEncodedTxBase64,
      chainId: "11155111",
    });

    res.status(200).json({
      message: "Successfully signed the transaction using the session-based Para wallet.",
      signTransactionResult,
    });
  } catch (error) {
    console.error("Error in paraSessionSignHandler:", error);
    next(error);
  }
}
