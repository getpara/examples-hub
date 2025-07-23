import { Handler } from "@std/http";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import Example from "../contracts/Example.json" with { type: "json" };
import { encodeFunctionData, http, LocalAccount, WalletClient } from "viem";
import { customSignAuthorization, customSignMessage } from "../utils/signature-utils.ts";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];
const PARA_API_KEY = Deno.env.get("PARA_API_KEY");
const PARA_ENVIRONMENT = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;
const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY");
const ALCHEMY_GAS_POLICY_ID = Deno.env.get("ALCHEMY_GAS_POLICY_ID");
const ALCHEMY_RPC_URL = Deno.env.get("ALCHEMY_RPC_URL");

export const signWithAlchemyEIP7702: Handler = async (req: Request): Promise<Response> => {
  try {
    if (!PARA_API_KEY || !ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID || !ALCHEMY_RPC_URL) {
      return new Response(JSON.stringify({
        success: false,
        message: "Missing required environment variables",
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const session = body.session as string | undefined;

    if (!session) {
      return new Response(JSON.stringify({
        success: false,
        message: "Missing session in request body",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    await para.importSession(session);

    const viemParaAccount: LocalAccount = createParaAccount(para);

    viemParaAccount.signMessage = ({ message }) => customSignMessage(para, message);
    viemParaAccount.signAuthorization = (authorization) => {
      return customSignAuthorization(para, authorization);
    };

    // @ts-ignore - Deno npm module duplication issue with viem types
    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(ALCHEMY_RPC_URL),
    });

    // @ts-ignore - Deno npm module duplication issue with viem types
    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    // @ts-ignore - Deno npm module duplication issue with viem types
    const alchemyClient = await createModularAccountV2Client({
      mode: "7702",
      transport: alchemy({
        rpcUrl: ALCHEMY_RPC_URL,
      }),
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      policyId: ALCHEMY_GAS_POLICY_ID,
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

    console.log("Alchemy EIP-7702 - User operation result:", userOperationResult);

    await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    return new Response(JSON.stringify({
      success: true,
      message: "User operation batch sent successfully using Alchemy + Para with EIP-7702",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("EIP-7702 transaction error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "EIP-7702 transaction failed",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};