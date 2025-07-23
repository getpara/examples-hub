import { Request, Response } from "express";
import { create7702KernelAccount, create7702KernelAccountClient } from "@zerodev/ecdsa-validator";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_3 } from "@zerodev/sdk/constants";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { arbitrumSepolia } from "viem/chains";
import { createPublicClient, encodeFunctionData, http, parseGwei, LocalAccount } from "viem";
import Example from "../contracts/Example.json";
import { customSignAuthorization, customSignMessage } from "../utils/signature-utils.js";

// Environment variables
const PARA_API_KEY = process.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
const ZERODEV_PROJECT_ID = process.env.ZERODEV_PROJECT_ID;
const ZERODEV_BUNDLER_RPC = process.env.ZERODEV_BUNDLER_RPC;
const ZERODEV_PAYMASTER_RPC = process.env.ZERODEV_PAYMASTER_RPC;
const ZERODEV_RPC_URL = process.env.ZERODEV_ARBITRUM_SEPOLIA_RPC;

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];

export async function zerodevEip7702SignHandler(req: Request, res: Response): Promise<void> {
  try {
    const session = req.body.session as string | undefined;

    if (!session) {
      res.status(400).json({ success: false, message: "Provide session in the request body" });
      return;
    }

    if (!PARA_API_KEY || !ZERODEV_PROJECT_ID || !ZERODEV_BUNDLER_RPC || !ZERODEV_PAYMASTER_RPC || !ZERODEV_RPC_URL) {
      res.status(500).json({
        success: false,
        message:
          "Missing required environment variables (PARA_API_KEY, ZERODEV_PROJECT_ID, ZERODEV_BUNDLER_RPC, ZERODEV_PAYMASTER_RPC, ZERODEV_ARBITRUM_SEPOLIA_RPC)",
      });
      return;
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);
    await para.importSession(session);

    const viemParaAccount: LocalAccount = createParaAccount(para);
    viemParaAccount.signMessage = async ({ message }) => customSignMessage(para, message);
    viemParaAccount.signAuthorization = async (authorization) => customSignAuthorization(para, authorization);

    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(ZERODEV_RPC_URL),
    });

    const kernelVersion = KERNEL_V3_3;
    const entryPoint = getEntryPoint("0.7");

    const kernelAccount = await create7702KernelAccount(publicClient, {
      signer: viemParaAccount,
      entryPoint,
      kernelVersion,
    });

    const paymasterClient = createZeroDevPaymasterClient({
      chain: arbitrumSepolia,
      transport: http(ZERODEV_PAYMASTER_RPC),
    });

    const kernelAccountClient = create7702KernelAccountClient({
      account: kernelAccount,
      chain: arbitrumSepolia,
      bundlerTransport: http(ZERODEV_BUNDLER_RPC),
      paymaster: paymasterClient,
      client: publicClient,
      userOperation: {
        estimateFeesPerGas: async () => ({
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

    res.status(200).json({
      success: true,
      message: "User operation batch sent using ZeroDev EIP-7702 + Para (session-based) with viem signer",
    });
  } catch (error) {
    console.error("Error in zerodevEip7702SignHandler:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to execute EIP-7702 transaction",
    });
  }
}
