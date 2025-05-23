import type { NextFunction, Request, Response } from "express";

import { Para as ParaServer, Environment, hexStringToBase64, SuccessfulSignatureRes } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";

import { http, encodeFunctionData, hashMessage, SignableMessage, Hash, LocalAccount, WalletClient } from "viem";
import { arbitrumSepolia } from "viem/chains";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";

import Example from "../../artifacts/Example.json" with { type: "json" };

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
    const env = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

    if (!paraApiKey || !projectId || !bundlerRpc || !paymasterRpc || !rpcUrl) {
      res
        .status(500)
        .send(
          "Missing required environment variables (PARA_API_KEY, ZERODEV_PROJECT_ID, ZERODEV_BUNDLER_RPC, ZERODEV_PAYMASTER_RPC, ARBITRUM_SEPOLIA_RPC)."
        );
      return;
    }

    const para = new ParaServer(env, paraApiKey);
    await para.importSession(session);

    const viemParaAccount: LocalAccount = createParaAccount(para);

    viemParaAccount.signMessage = async ({ message }) => customSignMessage(para, message);

    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(rpcUrl),
    });

    const entryPoint = getEntryPoint("0.7");
    const kernelVersion = KERNEL_V3_1;

    const ecdsaValidator = await signerToEcdsaValidator(viemClient, {
      signer: viemParaAccount,
      entryPoint,
      kernelVersion,
    });

    const account = await createKernelAccount(viemClient, {
      plugins: { sudo: ecdsaValidator },
      entryPoint,
      kernelVersion,
    });

    const zerodevPaymaster = createZeroDevPaymasterClient({
      chain: arbitrumSepolia,
      transport: http(paymasterRpc),
    });

    const kernelClient = createKernelAccountClient({
      account,
      chain: arbitrumSepolia,
      bundlerTransport: http(bundlerRpc),
      paymaster: {
        getPaymasterData: (userOperation) => zerodevPaymaster.sponsorUserOperation({ userOperation }),
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
      message: "User operation batch sent using ZeroDev + Para (pregen-based) with viem signer.",
      accountAddress: kernelClient.account.address,
      userOpHash,
    });
  } catch (error) {
    console.error("Error in zerodevSessionSignHandler:", error);
    next(error);
  }
}
