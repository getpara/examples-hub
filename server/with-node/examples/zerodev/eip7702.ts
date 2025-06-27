import type { Request, Response } from "express";

import { create7702KernelAccount, create7702KernelAccountClient } from "@zerodev/ecdsa-validator";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_3 } from "@zerodev/sdk/constants";

import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount } from "@getpara/viem-v2-integration";

import { arbitrumSepolia } from "viem/chains";
import { createPublicClient, encodeFunctionData, http, parseGwei, type LocalAccount } from "viem";

import Example from "../../artifacts/Example.json";
import { customSignAuthorization, customSignMessage } from "../../utils/signature-utils.js";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];

export async function zerodevEip7702SignHandler(req: Request, res: Response): Promise<void> {
  try {
    const session = req.body.session as string | undefined;

    if (!session) {
      res.status(400).json({
        error: "Missing session",
        message: "Provide `session` in the request body.",
      });
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    const projectId = process.env.ZERODEV_PROJECT_ID;
    const bundlerRpc = process.env.ZERODEV_BUNDLER_RPC;
    const paymasterRpc = process.env.ZERODEV_PAYMASTER_RPC;
    const rpcUrl = process.env.ZERODEV_ARBITRUM_SEPOLIA_RPC;
    const env = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

    if (!paraApiKey || !projectId || !bundlerRpc || !paymasterRpc || !rpcUrl) {
      res.status(500).json({
        error: "Missing environment variables",
        message:
          "Missing required environment variables (PARA_API_KEY, ZERODEV_PROJECT_ID, ZERODEV_BUNDLER_RPC, ZERODEV_PAYMASTER_RPC, ZERODEV_ARBITRUM_SEPOLIA_RPC).",
      });
      return;
    }

    const para = new ParaServer(env, paraApiKey);
    await para.importSession(session);

    const viemParaAccount: LocalAccount = createParaAccount(para);
    viemParaAccount.signMessage = async ({ message }) => customSignMessage(para, message);
    viemParaAccount.signAuthorization = async (authorization) => customSignAuthorization(para, authorization);

    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpcUrl),
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
      transport: http(paymasterRpc),
    });

    const kernelAccountClient = create7702KernelAccountClient({
      account: kernelAccount,
      chain: arbitrumSepolia,
      bundlerTransport: http(bundlerRpc),
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

    res.status(200).json({
      message: "User operation batch sent using ZeroDev EIP-7702 + Para (session-based) with viem signer.",
      kernelAccount: kernelAccount.address,
      originalEOA: viemParaAccount.address,
      userOpHash,
      receipt: {
        transactionHash: receipt.receipt.transactionHash,
        blockNumber: receipt.receipt.blockNumber.toString(),
        gasUsed: receipt.receipt.gasUsed.toString(),
      },
      eip7702Info: {
        note: "Your EOA has been temporarily upgraded to a smart account using EIP-7702",
        sameAddress: kernelAccount.address === viemParaAccount.address,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: "EIP-7702 transaction failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    } else {
      res.status(500).json({
        error: "Unknown error occurred",
        details: String(error),
      });
    }
  }
}
