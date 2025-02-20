import type { Request, Response, NextFunction } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { http } from "viem";
import { sepolia } from "viem/chains";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { zeroAddress } from "viem";
import { Signer } from "@zerodev/sdk/types";

export async function zerodevSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { session } = req.body as { session?: string };
    if (!session) {
      res.status(400).send("Provide `session` in the request body.");
      return;
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    const PROJECT_ID = process.env.ZERODEV_PROJECT_ID;
    const BUNDLER_RPC = process.env.ZERODEV_BUNDLER_RPC;
    const PAYMASTER_RPC = process.env.ZERODEV_PAYMASTER_RPC;
    const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC;

    if (!PARA_API_KEY || !PROJECT_ID || !BUNDLER_RPC || !PAYMASTER_RPC || !RPC_URL) {
      res
        .status(500)
        .send("Check PARA_API_KEY, ZERODEV_PROJECT_ID, ZERODEV_BUNDLER_RPC, ZERODEV_PAYMASTER_RPC, ZERODEV_RPC_URL.");
      return;
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    await para.importSession(session);

    const wallets = await para.getWallets();
    const wallet = Object.values(wallets)[0];
    if (!wallet) {
      res.status(500).send("No wallet found for this session.");
      return;
    }

    const viemParaAccount = createParaAccount(para);
    const viemClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: sepolia,
      transport: http(RPC_URL),
    });

    const entryPoint = getEntryPoint("0.7");
    const kernelVersion = KERNEL_V3_1;
    const publicClient = createParaViemClient(para, {
      chain: sepolia,
      transport: http("https://rpc-amoy.polygon.technology"),
    });

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: viemClient as Signer,
      entryPoint,
      kernelVersion,
    });

    const account = await createKernelAccount(publicClient, {
      plugins: { sudo: ecdsaValidator },
      entryPoint,
      kernelVersion,
    });

    const zerodevPaymaster = createZeroDevPaymasterClient({
      chain: sepolia,
      transport: http(PAYMASTER_RPC),
    });

    const kernelClient = createKernelAccountClient({
      account,
      chain: sepolia,
      bundlerTransport: http(BUNDLER_RPC),
      paymaster: {
        getPaymasterData: (userOperation) => zerodevPaymaster.sponsorUserOperation({ userOperation }),
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
      timeout: 1000 * 30,
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
