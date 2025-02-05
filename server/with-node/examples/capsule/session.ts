import type { Request, Response, NextFunction } from "express";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { RLP } from "@ethereumjs/rlp";

/**
 * Use this handler when you need to sign a transaction using a session-based Capsule wallet.
 *
 * Steps for developers:
 * 1. Ensure that the client-side session is already created and exported (using `capsuleClient.exportSession()` on the client side).
 * 2. Include the `session` in the request body to import the user's Capsule session on the server.
 * 3. Once the session is imported, access the user's wallets and sign a transaction.
 * 4. Use RLP-encoded and base64-converted transaction data as input to `capsuleClient.signTransaction`.
 *
 * Note:
 * - This example demonstrates session-based signing with Capsule.
 * - Implement authentication, authorization, and robust error handling for production scenarios.
 */
export async function capsuleSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Include `session` in the request body. This session should have been exported from the client side.
    const { session } = req.body as { session?: string };
    if (!session) {
      res
        .status(400)
        .send("Include `session` in the request body. This session must be previously exported from the client.");
      return;
    }

    // Ensure CAPSULE_API_KEY is set in the environment. Without it, you cannot interact with the Capsule service.
    const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
    if (!CAPSULE_API_KEY) {
      res.status(500).send("Set CAPSULE_API_KEY in the environment before using this handler.");
      return;
    }

    // Initialize the Capsule client and import the user's session.
    // The session ties the server-side Capsule client to the user's wallets established on the client side.
    const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
    await capsuleClient.importSession(session);

    // Retrieve the user's wallets from the imported session. You should have at least one wallet available if the session is valid.
    const wallets = await capsuleClient.getWallets();
    const wallet = Object.values(wallets)[0];
    if (!wallet) {
      res
        .status(500)
        .send("No wallet found after importing the session. Confirm that the session is valid and contains a wallet.");
      return;
    }

    // Extract the wallet ID and address to construct a sample transaction.
    const walletId = wallet.id;
    const walletAddress = wallet.address;

    // Construct a simple transaction. This is similar to the pregen example, but now tied to the session.
    const demoRawTx = {
      nonce: "0x00",
      gasPrice: "0x09184e72a000",
      gasLimit: "0x2710",
      to: walletAddress,
      from: walletAddress,
      value: "0x00",
      data: "0x",
    };

    // RLP-encode the transaction data before signing.
    const rlpEncodedTx = RLP.encode([
      demoRawTx.nonce,
      demoRawTx.gasPrice,
      demoRawTx.gasLimit,
      demoRawTx.to,
      demoRawTx.from,
      demoRawTx.value,
      demoRawTx.data,
    ]);

    // Convert the RLP-encoded transaction to base64 for Capsule signing.
    const rlpEncodedTxBase64 = Buffer.from(rlpEncodedTx).toString("base64");

    // Sign the transaction using the Capsule client and the imported session wallet.
    // Again, "11155111" is the chainId for Sepolia; adjust this as needed for your target network.
    const signTransactionResult = await capsuleClient.signTransaction(walletId, rlpEncodedTxBase64, "11155111");

    res.status(200).json({
      message: "Successfully signed the transaction using the session-based Capsule wallet.",
      signTransactionResult,
    });
  } catch (error) {
    console.error("Error in capsuleSessionSignHandler:", error);
    next(error);
  }
}
