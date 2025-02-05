import { Handler } from "@std/http";
import { simulateVerifyToken } from "../utils/auth-utils.ts";
import { Capsule as CapsuleServer, hexStringToBase64, SuccessfulSignatureRes } from "@usecapsule/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { createCapsuleAccount, createCapsuleViemClient } from "@usecapsule/viem-v2-integration";
import { http, WalletClient, LocalAccount, SignableMessage, Hash } from "viem";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { WalletClientSigner, arbitrumSepolia } from "@alchemy/aa-core";
import { hashMessage } from "viem";
import Example from "../artifacts/Example.json" with { type: "json" };
import { BatchUserOperationCallData, SendUserOperationResult } from "@alchemy/aa-core";
import { encodeFunctionData } from "viem";

interface RequestBody {
  email: string;
}


export const signWithAlchemy: Handler = async (req: Request): Promise<Response> => {
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
    chain: arbitrumSepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  // This is a workaround to fix the v value of the signature on signMessage. This method overrides the default signMessage method with a custom implementation. See the customSignMessage function below.
  viemClient.signMessage = async ({ message }: { message: SignableMessage }): Promise<Hash> => {
    return customSignMessage(capsuleClient, message);
  };

  const walletClientSigner: WalletClientSigner = new WalletClientSigner(viemClient, "capsule");

  const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY");
  const ALCHEMY_GAS_POLICY_ID = Deno.env.get("ALCHEMY_GAS_POLICY_ID");

  if (!ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID) {
    return new Response("ALCHEMY_API_KEY or ALCHEMY_GAS_POLICY_ID not set", { status: 500 });
  }

  const alchemyClient = await createModularAccountAlchemyClient({
    apiKey: ALCHEMY_API_KEY,
    chain: arbitrumSepolia,
    signer: walletClientSigner,
    gasManagerConfig: {
      policyId: ALCHEMY_GAS_POLICY_ID,
    },
  });

  const demoUserOperations: BatchUserOperationCallData = [1, 2, 3, 4, 5].map((x) => {
    return {
      target: "0x7920b6d8b07f0b9a3b96f238c64e022278db1419",
      data: encodeFunctionData({
        abi: Example["contracts"]["contracts/Example.sol:Example"]["abi"],
        functionName: "changeX",
        args: [x],
      }),
    };
  });

  const userOperationResult: SendUserOperationResult = await alchemyClient.sendUserOperation({
    uo: demoUserOperations,
  });

  return new Response(JSON.stringify({route:"signWithAlchemy", userOperationResult}), { status: 200 });
};

async function customSignMessage(capsule: CapsuleServer, message: SignableMessage): Promise<Hash> {
  const hashedMessage = hashMessage(message);
  const res = await capsule.signMessage(Object.values(capsule.wallets!)[0]!.id, hexStringToBase64(hashedMessage));

  let signature = (res as SuccessfulSignatureRes).signature;

  // Fix the v value of the signature
  const lastByte = parseInt(signature.slice(-2), 16);
  if (lastByte < 27) {
    const adjustedV = (lastByte + 27).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedV;
  }

  return `0x${signature}`;
}
