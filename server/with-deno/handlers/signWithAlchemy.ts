// deno-lint-ignore-file require-await no-explicit-any
import { Para as ParaServer, hexStringToBase64, Environment } from "@getpara/server-sdk";
import type { SuccessfulSignatureRes } from "@getpara/server-sdk";
import { decrypt } from "../utils/encryption-utils.ts";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { createParaAccount, createParaViemClient } from "npm:@getpara/viem-v2-integration@1.11.0";
import { http, encodeFunctionData, hashMessage } from "npm:viem@2.8.6";
import type { WalletClient, SignableMessage, Hash, Chain, LocalAccount } from "npm:viem@2.8.6";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { WalletClientSigner, arbitrumSepolia } from "@alchemy/aa-core";
import Example from "../artifacts/Example.json" with { type: "json" };
import type { BatchUserOperationCallData } from "@alchemy/aa-core";
import { Handler } from "@std/http";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];

async function customSignMessage(para: ParaServer, message: SignableMessage): Promise<Hash> {
  const wallet = para.wallets ? Object.values(para.wallets)[0] : null;
  if (!wallet) {
    throw new Error("Para wallet not available for signing.");
  }

  const hashedMessage = hashMessage(message);
  const messagePayload = hashedMessage.startsWith("0x") ? hashedMessage.substring(2) : hashedMessage;
  const messageBase64 = hexStringToBase64(messagePayload);

  const res = await para.signMessage({
    walletId: wallet.id,
    messageBase64: messageBase64,
  });

  if (!("signature" in res)) {
    throw new Error(`Signature failed or unexpected response: ${JSON.stringify(res)}`);
  }

  let signature = (res as SuccessfulSignatureRes).signature;

  const vHex = signature.slice(-2);
  const v = parseInt(vHex, 16);
  if (!isNaN(v) && v < 27) {
    const adjustedVHex = (v + 27).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedVHex;
  } else if (isNaN(v)) {
    console.warn("Could not parse 'v' value from signature for adjustment:", vHex);
  }

  return `0x${signature}`;
}

export const signWithAlchemy: Handler = async (req: Request): Promise<Response> => {
  try {
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response("Email is required in the request body", { status: 400 });
    }

    const paraApiKey = Deno.env.get("PARA_API_KEY");
    const alchemyApiKey = Deno.env.get("ALCHEMY_API_KEY");
    const alchemyGasPolicyId = Deno.env.get("ALCHEMY_GAS_POLICY_ID");
    const rpcUrl = Deno.env.get("ARBITRUM_SEPOLIA_RPC") || "https://ethereum-sepolia-rpc.publicnode.com";
    const envString = Deno.env.get("PARA_ENVIRONMENT") || "BETA";
    const env = envString as Environment;

    if (!paraApiKey || !alchemyApiKey || !alchemyGasPolicyId) {
      return new Response(JSON.stringify({ error: "Missing required environment variables" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const para = new ParaServer(env, paraApiKey, { disableWebSockets: true });

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      return new Response(JSON.stringify({ error: `Pregenerated wallet does not exist for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      return new Response(JSON.stringify({ error: `Key share not found in DB for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);
 
    const viemParaAccount: LocalAccount = await createParaAccount(para);

    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia as Chain,
      transport: http(rpcUrl),
    });

    viemClient.signMessage = async ({ message }: { message: SignableMessage }) => customSignMessage(para, message);

    const walletClientSigner = new WalletClientSigner(viemClient as any, "para");

    const alchemyClient = await createModularAccountAlchemyClient({
      apiKey: alchemyApiKey,
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      gasManagerConfig: {
        policyId: alchemyGasPolicyId,
      },
    });

    const demoUserOperations: BatchUserOperationCallData = [1, 2, 3, 4, 5].map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: EXAMPLE_ABI,
        functionName: "changeX",
        args: [x],
      }),
    }));

    const userOperationResult = await alchemyClient.sendUserOperation({ uo: demoUserOperations });

    return new Response(JSON.stringify({ route: "signWithAlchemy", userOperationResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};