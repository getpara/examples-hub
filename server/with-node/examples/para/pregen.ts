import type { Request, Response, NextFunction } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { RLP } from "@ethereumjs/rlp";

/**
 * Use this handler when you need to sign a transaction directly with a pre-generated Para wallet,
 * without integrating additional account abstraction clients.
 *
 * Steps for developers:
 * 1. Before calling this handler, ensure that the user's pre-generated wallet and key share are already
 *    created and stored (see `pregen-create.ts` for an example of this process).
 * 2. Provide the user's `email` in the request body so you can look up their pre-generated wallet and key share.
 * 3. Decrypt the user's key share and set it on the Para client. This step enables signing operations.
 * 4. Construct a transaction, RLP-encode it, and convert it to base64. Para's signing methods require base64-encoded input.
 * 5. Use `para.signTransaction` to sign the transaction with the pre-generated wallet.
 *
 * Note:
 * - This example focuses solely on demonstrating a simple signing operation with Para.
 * - You are responsible for implementing authentication, authorization, environment variable management,
 *   and error handling appropriate for your production environment.
 */
export async function paraPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Ensure you include `email` in the request body. This identifies the user's pre-generated wallet and key share.
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).send("Include `email` in the request body. This email should map to a pre-generated wallet.");
      return;
    }

    // Confirm that PARA_API_KEY is set in the environment. If not, remind yourself to configure it before proceeding.
    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res.status(500).send("Set PARA_API_KEY in the environment before using this handler.");
      return;
    }

    // Initialize the Para client with the specified environment and API key.
    // In this example, we use the BETA environment for demonstration purposes.
    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    // Check if the pre-generated wallet exists for the provided email. If it does not, instruct the user to create one first.
    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email. Have the user create one first.");
      return;
    }

    // Retrieve the user's key share from your database. The key share must have been previously stored.
    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res
        .status(400)
        .send("Key share not found. Confirm that the wallet was properly initialized and the key share stored.");
      return;
    }

    // Decrypt the key share before providing it to Para.
    // This enables Para to produce MPC-based signatures for the user's pre-generated wallet.
    const decryptedKeyShare = decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    // Retrieve the user's wallets from Para. This should return at least one wallet if the setup was correct.
    const wallets = await para.getWallets();
    const wallet = Object.values(wallets)[0];
    if (!wallet) {
      res
        .status(500)
        .send("No wallet found after setting the user share. Confirm that the pre-generated wallet is available.");
      return;
    }

    // Extract the wallet ID and address. You will need these to build and sign your transaction.
    const walletId = wallet.id;
    const walletAddress = wallet.address;

    // Construct a simple transaction for demonstration. Here, we use the wallet's own address as both `to` and `from`.
    // Adjust these fields as needed for your own use case.
    const demoRawTx = {
      nonce: "0x00",
      gasPrice: "0x09184e72a000",
      gasLimit: "0x2710",
      to: walletAddress,
      from: walletAddress,
      value: "0x00",
      data: "0x",
    };

    // RLP-encode the transaction. Para requires the transaction data to be encoded in RLP before signing.
    const rlpEncodedTx = RLP.encode([
      demoRawTx.nonce,
      demoRawTx.gasPrice,
      demoRawTx.gasLimit,
      demoRawTx.to,
      demoRawTx.from,
      demoRawTx.value,
      demoRawTx.data,
    ]);

    // Convert the RLP-encoded transaction to base64. Para's signing interface expects a base64-encoded string.
    const rlpEncodedTxBase64 = Buffer.from(rlpEncodedTx).toString("base64");

    // Sign the transaction using the Para client.
    // Replace "11155111" with the appropriate chainId for your target network (e.g., Ethereum Sepolia).
    // You now have a signed transaction that you can broadcast to the network using your preferred method.
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
