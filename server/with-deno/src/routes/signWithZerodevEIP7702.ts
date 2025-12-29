import { Handler } from "@std/http";
import { create7702KernelAccount, create7702KernelAccountClient } from "@zerodev/ecdsa-validator";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_3 } from "@zerodev/sdk/constants";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { arbitrumSepolia } from "viem/chains";
import { createPublicClient, encodeFunctionData, http, parseGwei } from "viem";
import Example from "../contracts/Example.json" with { type: "json" };

// Environment variables
const PARA_API_KEY = Deno.env.get("PARA_API_KEY");
const PARA_ENVIRONMENT = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;
const ZERODEV_PROJECT_ID = Deno.env.get("ZERODEV_PROJECT_ID");
const ZERODEV_BUNDLER_RPC = Deno.env.get("ZERODEV_BUNDLER_RPC");
const ZERODEV_PAYMASTER_RPC = Deno.env.get("ZERODEV_PAYMASTER_RPC");
const ZERODEV_RPC_URL = Deno.env.get("ZERODEV_ARBITRUM_SEPOLIA_RPC");

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];

export const signWithZerodevEIP7702: Handler = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const session = body.session as string | undefined;

    if (!session) {
      return new Response(JSON.stringify({ success: false, message: "Provide session in the request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!PARA_API_KEY || !ZERODEV_PROJECT_ID || !ZERODEV_BUNDLER_RPC || !ZERODEV_PAYMASTER_RPC || !ZERODEV_RPC_URL) {
      return new Response(JSON.stringify({
        success: false,
        message:
          "Missing required environment variables (PARA_API_KEY, ZERODEV_PROJECT_ID, ZERODEV_BUNDLER_RPC, ZERODEV_PAYMASTER_RPC, ZERODEV_ARBITRUM_SEPOLIA_RPC)",
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);
    await para.importSession(session);

    const viemParaAccount = createParaAccount(para);

    // @ts-ignore - Deno npm module duplication issue with viem types
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(ZERODEV_RPC_URL),
    });

    const kernelVersion = KERNEL_V3_3;
    const entryPoint = getEntryPoint("0.7");

    // @ts-ignore - Deno npm module duplication issue with viem types
    const kernelAccount = await create7702KernelAccount(publicClient, {
      signer: viemParaAccount,
      entryPoint,
      kernelVersion,
    });

    // @ts-ignore - Deno npm module duplication issue with viem types
    const paymasterClient = createZeroDevPaymasterClient({
      chain: arbitrumSepolia,
      transport: http(ZERODEV_PAYMASTER_RPC),
    });

    // @ts-ignore - Deno npm module duplication issue with viem types
    const kernelAccountClient = create7702KernelAccountClient({
      account: kernelAccount,
      chain: arbitrumSepolia,
      bundlerTransport: http(ZERODEV_BUNDLER_RPC),
      paymaster: paymasterClient,
      client: publicClient,
      userOperation: {
        estimateFeesPerGas: () => Promise.resolve({
          maxFeePerGas: parseGwei("0.24"),
          maxPriorityFeePerGas: parseGwei("0.001"),
        }),
      },
    });

    const calls = Array.from({ length: 5 }, (_, i) => i + 1).map((x) => ({
      to: EXAMPLE_CONTRACT_ADDRESS as `0x${string}`,
      value: 0n,
      data: encodeFunctionData({
        abi: EXAMPLE_ABI,
        functionName: "changeX",
        args: [x],
      }),
    }));

    const userOpHash = await kernelAccountClient.sendUserOperation({
      calls,
    });

    const receipt = await kernelAccountClient.waitForUserOperationReceipt({
      hash: userOpHash,
      timeout: 30000,
    });

    console.log("User operation receipt:", receipt);

    return new Response(JSON.stringify({
      success: true,
      message: "User operation batch sent using ZeroDev EIP-7702 + Para (session-based) with viem signer",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in zerodevEip7702SignHandler:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : "Failed to execute EIP-7702 transaction",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};