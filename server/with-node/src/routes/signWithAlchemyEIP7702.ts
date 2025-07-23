import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import ParaServer, { Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { Request, Response } from "express";
import Example from "../contracts/Example.json";
import { encodeFunctionData, http, LocalAccount, WalletClient } from "viem";
import { customSignAuthorization, customSignMessage } from "../utils/signature-utils.js";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];
const PARA_API_KEY = process.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_GAS_POLICY_ID = process.env.ALCHEMY_GAS_POLICY_ID;
const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;

export async function alchemyEip7702SignHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!PARA_API_KEY || !ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID || !ALCHEMY_RPC_URL) {
      res.status(500).json({
        success: false,
        message: "Missing required environment variables",
      });
      return;
    }

    const session = req.body.session as string | undefined;

    if (!session) {
      res.status(400).json({
        success: false,
        message: "Missing session in request body",
      });
      return;
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    await para.importSession(session);

    const viemParaAccount: LocalAccount = createParaAccount(para);

    viemParaAccount.signMessage = async ({ message }) => customSignMessage(para, message);
    viemParaAccount.signAuthorization = async (authorization) => {
      return customSignAuthorization(para, authorization);
    };

    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(ALCHEMY_RPC_URL),
    });

    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountV2Client({
      mode: "7702",
      transport: alchemy({
        rpcUrl: ALCHEMY_RPC_URL,
      }),
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      policyId: ALCHEMY_GAS_POLICY_ID,
    });

    const demoUserOperations: BatchUserOperationCallData = Array.from({ length: 5 }, (_, i) => i + 1).map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: EXAMPLE_ABI,
        functionName: "changeX",
        args: [x],
      }),
    }));

    const userOperationResult = await alchemyClient.sendUserOperation({
      uo: demoUserOperations,
    });

    console.log("Alchemy EIP-7702 - User operation result:", userOperationResult);

    await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    res.status(200).json({
      success: true,
      message: "User operation batch sent successfully using Alchemy + Para with EIP-7702",
    });
  } catch (error) {
    console.error("EIP-7702 transaction error:", error);
    res.status(500).json({
      success: false,
      message: "EIP-7702 transaction failed",
    });
  }
}
