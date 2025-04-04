import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { http, zeroAddress } from "viem";
import { sepolia } from "viem/chains";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { Signer } from "@zerodev/sdk/types";

export async function zerodevSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = req.body.session as string | undefined;

    if (!session) {
      res.status(400).send("Provide `session` in the request body.");
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    const projectId = process.env.ZERODEV_PROJECT_ID;
    const bundlerRpc = process.env.ZERODEV_BUNDLER_RPC;
    const paymasterRpc = process.env.ZERODEV_PAYMASTER_RPC;
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC;

    if (!paraApiKey || !projectId || !bundlerRpc || !paymasterRpc || !rpcUrl) {
      res
        .status(500)
        .send(
          "Missing required environment variables (PARA_API_KEY, ZERODEV_PROJECT_ID, ZERODEV_BUNDLER_RPC, ZERODEV_PAYMASTER_RPC, ARBITRUM_SEPOLIA_RPC)."
        );
      return;
    }

    const para = new ParaServer(Environment.BETA, paraApiKey);
    await para.importSession(session);

    const viemParaAccount = createParaAccount(para);
    const viemSignerClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: sepolia,
      transport: http(rpcUrl),
    });
    const publicClient = createParaViemClient(para, {
      // Using Para for public client too, consistent with previous turn's simplification
      chain: sepolia,
      transport: http(rpcUrl),
    });

    const entryPoint = getEntryPoint("0.7");
    const kernelVersion = KERNEL_V3_1;

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: viemSignerClient as Signer,
      entryPoint,
      kernelVersion,
    });

    const account = await createKernelAccount(publicClient, {
      plugins: { sudo: ecdsaValidator },
      entryPoint,
      kernelVersion,
    });

    const kernelClient = createKernelAccountClient({
      account,
      chain: sepolia,
      bundlerTransport: http(bundlerRpc),
      paymaster: {
        getPaymasterData: (userOperation: any) => {
          const zerodevPaymaster = createZeroDevPaymasterClient({
            chain: sepolia,
            transport: http(paymasterRpc),
          });

          return zerodevPaymaster.sponsorUserOperation({ userOperation });
        },
      },
    });

    const userOpHash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([
        {
          to: zeroAddress,
          value: 0n,
          data: "0x",
        },
      ]),
    });

    await kernelClient.waitForUserOperationReceipt({
      hash: userOpHash,
      timeout: 30000,
    });

    res.status(200).json({
      message: "User operation sent using ZeroDev + Para (session-based) with viem signer.",
      accountAddress: kernelClient.account.address,
      userOpHash,
    });
  } catch (error) {
    console.error("Error in zerodevSessionSignHandler:", error);
    next(error);
  }
}
