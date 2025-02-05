import { simulateVerifyToken } from "../utils/auth-utils";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { CapsuleEthersSigner } from "@usecapsule/ethers-v6-integration";
import { ethers } from "ethers";
import type { TransactionRequest } from "ethers";

/**
 * Handles signing with Ethers and CapsuleEthersSigner.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response containing the sign message and transaction result.
 */
export const signWithEthers = async (req: Request): Promise<Response> => {
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

  // Initialize Ethers provider and CapsuleEthersSigner
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  const capsuleEthersSigner = new CapsuleEthersSigner(capsuleClient, provider);

  // Get address
  const address = await capsuleEthersSigner.getAddress();

  // Create and sign a demo transaction
  const demoTx: TransactionRequest = {
    to: address,
    from: address,
    value: ethers.parseEther("0.01"),
    nonce: await provider.getTransactionCount(address),
    gasLimit: 21000,
    gasPrice: (await provider.getFeeData()).gasPrice,
  };

  const signTransactionResult = await capsuleEthersSigner.signTransaction(demoTx);

  // Return the result
  return new Response(JSON.stringify({ route: "signWithEthers", signTransactionResult }), { status: 200 });
};
