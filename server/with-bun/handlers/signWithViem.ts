import { simulateVerifyToken } from "../utils/auth-utils";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { sepolia } from "viem/chains";
import { http, parseEther, parseGwei } from "viem";
import type { SignTransactionParameters, WalletClient, Chain, Account, LocalAccount } from "viem";

/**
 * Handles signing with Viem and ParaViemClient.
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

  // Ensure PARA_API_KEY is available
  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    return new Response("PARA_API_KEY not set", { status: 500 });
  }

  // Initialize Para client and check if wallet exists
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

  // Create Viem account and client
  const viemParaAccount: LocalAccount = await createParaAccount(para);
  const viemClient: WalletClient = createParaViemClient(para, {
    account: viemParaAccount,
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  // Create and sign a demo transaction
  const demoTx: SignTransactionParameters<Chain | undefined, Account | undefined, Chain | undefined> = {
    account: viemParaAccount,
    chain: sepolia,
    to: viemParaAccount.address,
    value: parseEther("0.001"),
    gas: 21000n,
    maxFeePerGas: parseGwei("20"),
    maxPriorityFeePerGas: parseGwei("3"),
  };

  const signatureResult = await viemClient.signTransaction(demoTx);

  // Return the result
  return new Response(JSON.stringify({ route: "signWithViem", signatureResult }), { status: 200 });
};
