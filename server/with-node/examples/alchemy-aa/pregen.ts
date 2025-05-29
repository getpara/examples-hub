import type { Request, Response } from "express";

import { alchemy } from "@account-kit/infra";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";

import { arbitrumSepolia } from "viem/chains";
import { encodeFunctionData, http, type LocalAccount, type WalletClient } from "viem";

import Example from "../../artifacts/Example.json";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { customSignMessage } from "../../utils/signature-utils.js";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];

export async function alchemyPregenSignHandler(req: Request, res: Response): Promise<void> {
  try {
    const email = req.body.email as string | undefined;

    if (!email) {
      res.status(400).json({
        error: "Missing email",
        message: "Provide `email` in the request body.",
      });
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    const alchemyGasPolicyId = process.env.ALCHEMY_GAS_POLICY_ID;
    const rpcUrl = process.env.ALCHEMY_ARBITRUM_SEPOLIA_RPC;
    const env = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

    if (!paraApiKey || !alchemyApiKey || !alchemyGasPolicyId || !rpcUrl) {
      res.status(500).json({
        error: "Missing environment variables",
        message:
          "Missing required environment variables (PARA_API_KEY, ALCHEMY_API_KEY, ALCHEMY_GAS_POLICY_ID, ALCHEMY_ARBITRUM_SEPOLIA_RPC).",
      });
      return;
    }

    const para = new ParaServer(env, paraApiKey);

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).json({
        error: "Wallet not found",
        message: "No pre-generated wallet found for this email.",
      });
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).json({
        error: "Key share not found",
        message: "Key share not found for this email.",
      });
      return;
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const viemParaAccount: LocalAccount = createParaAccount(para);
    viemParaAccount.signMessage = async ({ message }) => customSignMessage(para, message);

    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(rpcUrl),
    });

    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountAlchemyClient({
      transport: alchemy({
        rpcUrl: rpcUrl,
      }),
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      policyId: alchemyGasPolicyId,
    });

    const demoUserOperations: BatchUserOperationCallData = Array.from({ length: 5 }, (_, i) => i + 1).map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: EXAMPLE_ABI,
        functionName: "changeX",
        args: [x],
      }),
    }));

    const userOperationResult = await alchemyClient.sendUserOperation({ uo: demoUserOperations });

    const txHash = await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    res.status(200).json({
      message: "User operation batch sent using Alchemy + Para (pregen-based) with viem signer.",
      accountAddress: alchemyClient.account.address,
      originalEOA: viemParaAccount.address,
      userOpHash: userOperationResult.hash,
      receipt: {
        transactionHash: txHash,
        blockNumber: "",
        gasUsed: "",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: "Transaction failed",
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
