import { Handler } from "@std/http";
import { simulateVerifyToken } from "../utils/auth-utils.ts";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { createCapsuleAccount, createCapsuleViemClient } from "@usecapsule/viem-v2-integration";
import { sepolia } from "viem/chains";
import {
  http,
  parseEther,
  SignTransactionParameters,
  WalletClient,
  Chain,
  Account,
  LocalAccount,
  parseGwei,
} from "viem";

interface RequestBody {
  email: string;
}

export const signWithViem: Handler = async (req: Request): Promise<Response> => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  const user = simulateVerifyToken(token);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { email }: RequestBody = await req.json();

  if (user.email !== email) {
    return new Response("Forbidden", { status: 403 });
  }

  const CAPSULE_API_KEY = Deno.env.get("CAPSULE_API_KEY");

  if (!CAPSULE_API_KEY) {
    return new Response("CAPSULE_API_KEY not set", { status: 500 });
  }

  const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);

  const hasPregenWallet = await capsuleClient.hasPregenWallet(email);

  if (!hasPregenWallet) {
    return new Response("Wallet does not exist", { status: 400 });
  }

  const keyShare = getKeyShareInDB(email);

  if (!keyShare) {
    return new Response("Key share does not exist", { status: 400 });
  }

  const decryptedKeyShare = decrypt(keyShare);

  await capsuleClient.setUserShare(decryptedKeyShare);

  const viemCapsuleAccount: LocalAccount = await createCapsuleAccount(capsuleClient);

  const viemClient: WalletClient = createCapsuleViemClient(capsuleClient, {
    account: viemCapsuleAccount,
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

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

  return new Response(JSON.stringify({ route: "signWithViem", signatureResult }), { status: 200 });
};
