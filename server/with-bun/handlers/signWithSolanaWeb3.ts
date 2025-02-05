import { simulateVerifyToken } from "../utils/auth-utils";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { CapsuleSolanaWeb3Signer } from "@usecapsule/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Handles signing with Solana Web3 and CapsuleSolanaWeb3Signer.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response containing the signed transaction result.
 */
export const signWithSolanaWeb3 = async (req: Request): Promise<Response> => {
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

  // Initialize Capsule client and check if wallet exists
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

  // Initialize Solana connection and signer
  const solanaConnection = new Connection(clusterApiUrl("testnet"));
  const solanaSigner = new CapsuleSolanaWeb3Signer(capsuleClient, solanaConnection);

  // Create and sign a demo transaction
  const demoTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: solanaSigner.sender!,
      toPubkey: solanaSigner.sender!,
      lamports: LAMPORTS_PER_SOL / 100,
    })
  );

  const signTransactionResult = await solanaSigner.signTransaction(demoTx);

  // Return the result
  return new Response(JSON.stringify({ route: "signWithSolanaWeb3", signTransactionResult }), { status: 200 });
};
