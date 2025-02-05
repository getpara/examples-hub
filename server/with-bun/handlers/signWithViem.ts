import { simulateVerifyToken } from "../utils/auth-utils";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { createCapsuleAccount, createCapsuleViemClient } from "@usecapsule/viem-v2-integration";
import { sepolia } from "viem/chains";
import { http, parseEther, parseGwei } from "viem";
import type { SignTransactionParameters, WalletClient, Chain, Account, LocalAccount } from "viem";

/**
 * Handles signing with Viem and CapsuleViemClient.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response containing the signed transaction result.
 */
export const signWithViem = async (req: Request): Promise<Response> => {
  // Validate Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

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

  // Create Viem account and client
  const viemCapsuleAccount: LocalAccount = await createCapsuleAccount(capsuleClient);
  const viemClient: WalletClient = createCapsuleViemClient(capsuleClient, {
    account: viemCapsuleAccount,
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  // Create and sign a demo transaction
  const demoTx: SignTransactionParameters<Chain | undefined, Account | undefined, Chain | undefined> = {
    account: viemCapsuleAccount,
    chain: sepolia,
    to: viemCapsuleAccount.address,
    value: parseEther("0.001"),
    gas: 21000n,
    maxFeePerGas: parseGwei("20"),
    maxPriorityFeePerGas: parseGwei("3"),
  };

  const signatureResult = await viemClient.signTransaction(demoTx);

  // Return the result
  return new Response(JSON.stringify({ route: "signWithViem", signatureResult }), { status: 200 });
};
