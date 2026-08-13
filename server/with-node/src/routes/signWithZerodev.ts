import { Request, Response } from "express";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { Environment } from "@getpara/server-sdk";
import { createParaViemAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { arbitrumSepolia } from "viem/chains";
import { createPublicClient, encodeFunctionData, http, parseGwei } from "viem";
import Example from "../contracts/Example.json" with { type: "json" };
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";
import { createParaServer } from "../utils/createParaServer.js";

export async function zerodevPregenSignHandler(req: Request, res: Response): Promise<void> {
  const PARA_API_KEY = process.env.PARA_API_KEY;
  const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
  const ZERODEV_BUNDLER_RPC = process.env.ZERODEV_BUNDLER_RPC;
  const ZERODEV_PAYMASTER_RPC = process.env.ZERODEV_PAYMASTER_RPC;
  const ZERODEV_RPC_URL = process.env.ZERODEV_ARBITRUM_SEPOLIA_RPC;
  const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
  const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];
  try {
    const email = req.body.email as string | undefined;

    if (!email) {
      res.status(400).json({ success: false, message: "Provide email in the request body" });
      return;
    }

    if (!PARA_API_KEY || !ZERODEV_BUNDLER_RPC || !ZERODEV_PAYMASTER_RPC || !ZERODEV_RPC_URL) {
      res.status(500).json({
        success: false,
        message:
          "Missing required environment variables (PARA_API_KEY, ZERODEV_BUNDLER_RPC, ZERODEV_PAYMASTER_RPC, ZERODEV_ARBITRUM_SEPOLIA_RPC)",
      });
      return;
    }

    const para = createParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });
    if (!hasPregenWallet) {
      res.status(400).json({ success: false, message: "No pre-generated wallet found for this email" });
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).json({ success: false, message: "Key share not found" });
      return;
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const viemParaAccount = createParaViemAccount({ para });

    const viemClient = createParaViemClient({ para, walletClientConfig: {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(ZERODEV_RPC_URL),
    } });

    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(ZERODEV_RPC_URL),
    });

    const signer = viemParaAccount;
    const entryPoint = getEntryPoint("0.7");
    const kernelVersion = KERNEL_V3_1;

    const ecdsaValidator = await signerToEcdsaValidator(viemClient, {
      signer,
      entryPoint,
      kernelVersion,
    });

    const kernelAccount = await createKernelAccount(publicClient, {
      plugins: { sudo: ecdsaValidator },
      entryPoint,
      kernelVersion,
    });

    const zerodevPaymaster = createZeroDevPaymasterClient({
      chain: arbitrumSepolia,
      transport: http(ZERODEV_PAYMASTER_RPC),
    });

    const kernelClient = createKernelAccountClient({
      account: kernelAccount,
      chain: arbitrumSepolia,
      bundlerTransport: http(ZERODEV_BUNDLER_RPC),
      paymaster: {
        getPaymasterData: (userOperation) => zerodevPaymaster.sponsorUserOperation({ userOperation }),
      },
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

    const userOpHash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls(calls),
    });

    await kernelClient.waitForUserOperationReceipt({
      hash: userOpHash,
      timeout: 30000,
    });

    res.status(200).json({
      success: true,
      message: "User operation batch sent using ZeroDev + Para (pregen-based) with viem signer",
    });
  } catch (error) {
    console.error("Error in zerodevPregenSignHandler:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to execute transaction",
    });
  }
}
