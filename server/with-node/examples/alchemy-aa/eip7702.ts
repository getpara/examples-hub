import type { NextFunction, Request, Response } from "express";

import { alchemy } from "@account-kit/infra";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import { Para as ParaServer, Environment, SuccessfulSignatureRes, hexStringToBase64 } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";

import { arbitrumSepolia } from "viem/chains";
import {
  encodeFunctionData,
  hashMessage,
  http,
  type Hash,
  type LocalAccount,
  type SignableMessage,
  type WalletClient,
} from "viem";

import Example from "../../artifacts/Example.json";

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

export async function alchemyEip7702SignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = req.body.session as string | undefined;

    if (!session) {
      res.status(400).json({
        error: "Missing session",
        message: "Session is required.",
      });
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    const alchemyGasPolicyId = process.env.ALCHEMY_GAS_POLICY_ID;
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC;
    const env = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

    if (!paraApiKey || !alchemyApiKey || !alchemyGasPolicyId || !rpcUrl) {
      res.status(500).json({
        error: "Missing environment variables",
        message:
          "Missing required environment variables (PARA_API_KEY, ALCHEMY_API_KEY, ALCHEMY_GAS_POLICY_ID, ARBITRUM_SEPOLIA_RPC).",
      });
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

    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    console.log("Creating Alchemy Modular Account V2 with EIP-7702 for EOA:", viemParaAccount.address);

    const alchemyClient = await createModularAccountV2Client({
      transport: alchemy({
        apiKey: alchemyApiKey,
      }),
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      mode: "7702",
      policyId: alchemyGasPolicyId,
    });

    const eoaAddress = viemParaAccount.address;
    console.log("EOA Address:", eoaAddress);

    const smartAccountAddress = alchemyClient.account.address;
    console.log("Smart Account Address (should match EOA):", smartAccountAddress);

    const demoUserOperations: BatchUserOperationCallData = Array.from({ length: 5 }, (_, i) => i + 1).map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: EXAMPLE_ABI,
        functionName: "changeX",
        args: [x],
      }),
    }));

    console.log("Sending batch user operations with Alchemy EIP-7702...");

    const userOperationResult = await alchemyClient.sendUserOperation({
      uo: demoUserOperations,
    });

    console.log("User operation sent:", userOperationResult);

    const txHash = await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    console.log("Transaction confirmed:", txHash);

    res.status(200).json({
      message: "Sent user operation using Alchemy + Para with EIP-7702 (session-based wallet, viem-based).",
      eoaAddress,
      smartAccountAddress,
      userOperationResult,
      transactionHash: txHash,
      eip7702Info: {
        note: "The EOA has been delegated to Modular Account V2 using EIP-7702. Future transactions will benefit from smart account features without changing the address.",
        sameAddress: smartAccountAddress === eoaAddress,
        provider: "Alchemy Account Kit",
      },
    });
  } catch (error) {
    console.error("Error in alchemyEip7702SignHandler:", error);

    if (error instanceof Error) {
      res.status(500).json({
        error: "Alchemy EIP-7702 transaction failed",
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
