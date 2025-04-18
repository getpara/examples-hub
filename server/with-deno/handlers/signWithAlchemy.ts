import { Handler } from "@std/http";
import { simulateVerifyToken } from "../utils/auth-utils.ts";
import { Para as ParaServer, hexStringToBase64, SuccessfulSignatureRes, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { http, WalletClient, LocalAccount, SignableMessage, Hash, Chain } from "viem";
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

  const PARA_API_KEY = Deno.env.get("PARA_API_KEY");

  if (!PARA_API_KEY) {
    return new Response("PARA_API_KEY not set", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY);

  const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });

  if (!hasPregenWallet) {
    return new Response("Wallet does not exist", { status: 400 });
  }

  const keyShare = getKeyShareInDB(email);

  if (!keyShare) {
    return new Response("Key share does not exist", { status: 400 });
  }

  const decryptedKeyShare = decrypt(keyShare);

  await para.setUserShare(decryptedKeyShare);

  const viemParaAccount: LocalAccount = await createParaAccount(para);

  const viemClient: WalletClient = createParaViemClient(para, {
    account: viemParaAccount,
    chain: arbitrumSepolia as Chain,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  // This is a workaround to fix the v value of the signature on signMessage. This method overrides the default signMessage method with a custom implementation. See the customSignMessage function below.
  viemClient.signMessage = async ({ message }: { message: SignableMessage }): Promise<Hash> => {
    return customSignMessage(para, message);
  };

  const walletClientSigner: WalletClientSigner = new WalletClientSigner(viemClient, "para");

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

async function customSignMessage(para: ParaServer, message: SignableMessage): Promise<Hash> {
  const hashedMessage = hashMessage(message);
  const res = await para.signMessage({
    walletId: Object.values(para.wallets!)[0]!.id,
    messageBase64: hexStringToBase64(hashedMessage),
  });

  let signature = (res as SuccessfulSignatureRes).signature;

  // Fix the v value of the signature
  const lastByte = parseInt(signature.slice(-2), 16);
  if (lastByte < 27) {
    const adjustedV = (lastByte + 27).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedV;
  }

  return `0x${signature}`;
}
