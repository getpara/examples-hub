import type { Request, Response } from "express";

import { alchemy } from "@account-kit/infra";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";

import { arbitrumSepolia } from "@account-kit/infra";
import { encodeFunctionData, http, type LocalAccount, type WalletClient } from "viem";

import Example from "../../artifacts/Example.json";
import { customSignAuthorization, customSignMessage } from "../../utils/signature-utils.js";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];

export async function alchemyEip7702SignHandler(req: Request, res: Response): Promise<void> {
  console.log("=== Starting EIP-7702 Transaction Handler ===");

  try {
    const session = req.body.session as string | undefined;
    console.log("Session received:", session ? "Yes" : "No");

    if (!session) {
      res.status(400).json({
        error: "Missing session",
        message: "Provide `session` in the request body.",
      });
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    const alchemyGasPolicyId = process.env.ALCHEMY_GAS_POLICY_ID;
    const rpcUrl = process.env.ALCHEMY_ARBITRUM_SEPOLIA_RPC;
    const env = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

    console.log("Environment variables check:", {
      paraApiKey: paraApiKey ? "Present" : "Missing",
      alchemyApiKey: alchemyApiKey ? "Present" : "Missing",
      alchemyGasPolicyId: alchemyGasPolicyId ? "Present" : "Missing",
      rpcUrl: rpcUrl ? "Present" : "Missing",
      environment: env,
    });

    if (!paraApiKey || !alchemyApiKey || !alchemyGasPolicyId || !rpcUrl) {
      res.status(500).json({
        error: "Missing environment variables",
        message:
          "Missing required environment variables (PARA_API_KEY, ALCHEMY_API_KEY, ALCHEMY_GAS_POLICY_ID, ALCHEMY_ARBITRUM_SEPOLIA_RPC).",
      });
      return;
    }

    console.log("1. Initializing Para Server...");
    const para = new ParaServer(env, paraApiKey);

    console.log("2. Importing session...");
    await para.importSession(session);
    console.log("   Session imported successfully");

    console.log("3. Creating Para Viem Account...");
    const viemParaAccount: LocalAccount = createParaAccount(para);
    console.log("   Account address:", viemParaAccount.address);

    viemParaAccount.signMessage = async ({ message }) => customSignMessage(para, message);
    viemParaAccount.signAuthorization = async (authorization) => {
      console.log("   Signing authorization:", authorization);
      return customSignAuthorization(para, authorization);
    };

    console.log("4. Creating Para Viem Client...");
    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(rpcUrl),
    });
    console.log("   Client created for chain:", arbitrumSepolia.name);

    console.log("5. Creating Wallet Client Signer...");
    const walletClientSigner = new WalletClientSigner(viemClient, "para");
    console.log("   Signer created");

    console.log("6. Creating Alchemy Modular Account Client...");
    console.log("   Mode: 7702");
    console.log("   Policy ID:", alchemyGasPolicyId);

    const alchemyClient = await createModularAccountV2Client({
      mode: "7702",
      transport: alchemy({
        rpcUrl: rpcUrl,
      }),
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      policyId: alchemyGasPolicyId,
    });

    console.log("   Alchemy client created");
    console.log("   Account address:", alchemyClient.account.address);
    console.log("   Is same as EOA?", alchemyClient.account.address === viemParaAccount.address);

    console.log("7. Preparing batch user operations...");
    const demoUserOperations: BatchUserOperationCallData = Array.from({ length: 5 }, (_, i) => i + 1).map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: EXAMPLE_ABI,
        functionName: "changeX",
        args: [x],
      }),
    }));

    console.log("   Batch operations prepared:");
    demoUserOperations.forEach((op, index) => {
      console.log(`   Operation ${index + 1}: changeX(${index + 1}) to ${op.target}`);
    });

    console.log("8. Sending user operation...");
    const userOperationResult = await alchemyClient.sendUserOperation({
      uo: demoUserOperations,
      value: 0n,
      data: "0x",
    });
    console.log("   User operation sent successfully");
    console.log("   UserOp Hash:", userOperationResult.hash);

    console.log("9. Waiting for transaction confirmation...");
    const txHash = await alchemyClient.waitForUserOperationTransaction(userOperationResult);
    console.log("   Transaction confirmed!");
    console.log("   Transaction Hash:", txHash);

    console.log("=== EIP-7702 Transaction Successful ===");

    res.status(200).json({
      message: "User operation batch sent using Alchemy + Para (session-based) with EIP-7702.",
      accountAddress: alchemyClient.account.address,
      originalEOA: viemParaAccount.address,
      userOpHash: userOperationResult.hash,
      receipt: {
        transactionHash: txHash,
        blockNumber: "",
        gasUsed: "",
      },
      eip7702Info: {
        note: "Your EOA has been temporarily upgraded to a smart account using EIP-7702",
        sameAddress: alchemyClient.account.address === viemParaAccount.address,
      },
    });
  } catch (error) {
    console.error("=== EIP-7702 Transaction Failed ===");
    console.error("Error details:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Log additional error properties if they exist
      if ("code" in error) {
        console.error("Error code:", (error as any).code);
      }
      if ("data" in error) {
        console.error("Error data:", JSON.stringify((error as any).data, null, 2));
      }
      if ("cause" in error) {
        console.error("Error cause:", (error as any).cause);
      }

      res.status(500).json({
        error: "EIP-7702 transaction failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    } else {
      console.error("Unknown error type:", typeof error);
      res.status(500).json({
        error: "Unknown error occurred",
        details: String(error),
      });
    }
  }
}
