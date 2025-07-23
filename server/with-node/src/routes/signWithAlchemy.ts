import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import ParaServer, { Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { Request, Response } from "express";
import Example from "../contracts/Example.json";
import { encodeFunctionData, http, LocalAccount, WalletClient } from "viem";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { customSignMessage } from "../utils/signature-utils.js";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];
const PARA_API_KEY = process.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_GAS_POLICY_ID = process.env.ALCHEMY_GAS_POLICY_ID;
const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;

export async function alchemyPregenSignHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!PARA_API_KEY || !ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID || !ALCHEMY_RPC_URL) {
      res.status(500).json({
        success: false,
        message: "Missing required environment variables",
      });
      return;
    }

    const email = req.body.email as string | undefined;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Missing email in request body",
      });
      return;
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });

    if (!hasPregenWallet) {
      res.status(400).json({
        success: false,
        message: "No pre-generated wallet found for this email",
      });
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).json({
        success: false,
        message: "Key share not found for this email",
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
      transport: http(ALCHEMY_RPC_URL),
    });

    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountAlchemyClient({
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

    const userOperationResult = await alchemyClient.sendUserOperation({ uo: demoUserOperations });

    console.log("Alchemy Pregen - User operation result:", userOperationResult);

    await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    res.status(200).json({
      success: true,
      message: "User operation batch sent successfully using Alchemy + Para with pre-generated wallet",
    });
  } catch (error) {
    console.error("Alchemy pregen transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Transaction failed",
    });
  }
}
