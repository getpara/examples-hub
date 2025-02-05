import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { simulateVerifyToken } from "../utils/auth-utils";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { RLP } from "@ethereumjs/rlp";

/**
 * Handles signing with Capsule PreGen and Capsule Client.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response with sign message and transaction results.
 */
export const signWithCapsulePreGen = async (req: Request): Promise<Response> => {
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

  // Ensure CAPSULE_API_KEY is available
  const CAPSULE_API_KEY = Bun.env.CAPSULE_API_KEY;
  if (!CAPSULE_API_KEY) {
    return new Response("CAPSULE_API_KEY not set", { status: 500 });
  }

  // Initialize Capsule client
  const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
  const hasPregenWallet = await capsuleClient.hasPregenWallet(email);

  if (!hasPregenWallet) {
    return new Response("Wallet does not exist", { status: 400 });
  }

  // Retrieve and decrypt key share
  const keyShare = getKeyShareInDB(email);
  if (!keyShare) {
    return new Response("Key share does not exist", { status: 400 });
  }

  const decryptedKeyShare = decrypt(keyShare);
  await capsuleClient.setUserShare(decryptedKeyShare);

  // Get wallet details
  const wallets = await capsuleClient.getWallets();
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
  const signTransactionResult = await capsuleClient.signTransaction(walletId, rlpEncodedTxBase64, "11155111");

  // Return the final signed transaction result
  return new Response(JSON.stringify({ route: "signWithCapsulePreGen", signTransactionResult }), {
    status: 200,
  });
};
