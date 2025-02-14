import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { simulateVerifyToken } from "../utils/auth-utils";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { RLP } from "@ethereumjs/rlp";

/**
 * Handles signing with Para PreGen and Para Client.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response with sign message and transaction results.
 */
export const signWithParaPreGen = async (req: Request): Promise<Response> => {
  // Validate Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use your own token verification logic here
  const token = authHeader.split(" ")[1];
  const user = simulateVerifyToken(token);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Parse and validate request body
  const { email }: RequestBody = await req.json();
  if (user.email !== email) {
    return new Response("Forbidden", { status: 403 });
  }

  // Ensure PARA_API_KEY is available
  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    return new Response("PARA_API_KEY not set", { status: 500 });
  }

  // Initialize Para client
  const para = new ParaServer(Environment.BETA, PARA_API_KEY);
  const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });

  if (!hasPregenWallet) {
    return new Response("Wallet does not exist", { status: 400 });
  }

  // Retrieve and decrypt key share
  const keyShare = getKeyShareInDB(email);
  if (!keyShare) {
    return new Response("Key share does not exist", { status: 400 });
  }

  const decryptedKeyShare = decrypt(keyShare);
  await para.setUserShare(decryptedKeyShare);

  // Get wallet details
  const wallets = await para.getWallets();
  const wallet = Object.values(wallets)[0];
  const walletId = wallet.id;
  const walletAddress = wallet.address;

  // Prepare raw transaction data. These are dummy values and should be replaced with actual values.
  const demoRawTx = {
    nonce: "0x00", // Should match the current nonce on the network
    gasPrice: "0x09184e72a000", // Should match the current gas price on the network
    gasLimit: "0x2710", // Gas limit for the transaction
    to: walletAddress, // Destination address
    from: walletAddress, // Source address
    value: "0x00", // No Ether transfer (0 value)
    data: "0x", // No data being sent
  };

  // RLP encode the transaction and convert to base64 (before signing)
  const rlpEncodedTx = RLP.encode([
    demoRawTx.nonce,
    demoRawTx.gasPrice,
    demoRawTx.gasLimit,
    demoRawTx.to,
    demoRawTx.from,
    demoRawTx.value,
    demoRawTx.data,
  ]);

  // Convert the RLP encoded transaction to base64 for signing
  const rlpEncodedTxBase64 = Buffer.from(rlpEncodedTx).toString("base64");

  // Sign the transaction
  const signTransactionResult = await para.signTransaction({ walletId, rlpEncodedTxBase64, chainId: "11155111" });

  // Return the final signed transaction result
  return new Response(JSON.stringify({ route: "signWithParaPreGen", signTransactionResult }), {
    status: 200,
  });
};
