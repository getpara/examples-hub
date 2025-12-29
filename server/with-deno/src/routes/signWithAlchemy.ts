import { Handler } from "@std/http";
import { arbitrumSepolia } from "@account-kit/infra";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { encodeFunctionData, http } from "viem";
import Example from "../contracts/Example.json" with { type: "json" };
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];
const PARA_API_KEY = Deno.env.get("PARA_API_KEY");
const PARA_ENVIRONMENT = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;
const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY");
const ALCHEMY_GAS_POLICY_ID = Deno.env.get("ALCHEMY_GAS_POLICY_ID");

export const signWithAlchemy: Handler = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const email = body.email as string | undefined;

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: "Provide email in the request body" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!PARA_API_KEY || !ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID) {
      return new Response(JSON.stringify({ success: false, message: "Missing required environment variables" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });
    if (!hasPregenWallet) {
      return new Response(JSON.stringify({ success: false, message: "No pre-generated wallet found for this email" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      return new Response(JSON.stringify({ success: false, message: "Key share not found" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const viemParaAccount = createParaAccount(para);

    // @ts-ignore - Deno npm module duplication issue with viem types
    const viemClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(),
    });

    // @ts-ignore - Deno npm module duplication issue with viem types
    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountAlchemyClient({
      apiKey: ALCHEMY_API_KEY,
      // @ts-ignore - Deno npm module duplication issue with viem types
      chain: arbitrumSepolia,
      // @ts-ignore - Deno npm module duplication issue with viem types
      signer: walletClientSigner,
      gasManagerConfig: {
        policyId: ALCHEMY_GAS_POLICY_ID,
      },
    });

    const demoUserOperations: BatchUserOperationCallData = Array.from({ length: 5 }, (_, i) => i + 1).map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: EXAMPLE_ABI,
        functionName: "changeX",
        args: [x],
      }),
    }));

    const userOperationResult = await alchemyClient.sendUserOperation({
      uo: demoUserOperations,
    });

    console.log("Alchemy - User operation result:", userOperationResult);

    await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    return new Response(JSON.stringify({
      success: true,
      message: "User operation batch sent using Alchemy + Para (pre-generated wallet)",
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in alchemyPregenSignHandler:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : "Failed to execute transaction",
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};