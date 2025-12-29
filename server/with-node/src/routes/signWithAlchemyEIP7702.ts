import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { BatchUserOperationCallData, SmartAccountSigner } from "@aa-sdk/core";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { Request, Response } from "express";
import { encodeFunctionData, type LocalAccount, type SignableMessage } from "viem";
import Example from "../contracts/Example.json";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";

export async function alchemyEip7702SignHandler(req: Request, res: Response): Promise<void> {
  const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
  const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];
  const PARA_API_KEY = process.env.PARA_API_KEY;
  const PARA_ENVIRONMENT = (process.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  const ALCHEMY_GAS_POLICY_ID = process.env.ALCHEMY_GAS_POLICY_ID;
  const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;

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

    const viemParaAccount = createParaAccount(para);

    const paraSigner: SmartAccountSigner<LocalAccount> = {
      signerType: "para",
      inner: viemParaAccount,
      getAddress: async () => viemParaAccount.address,
      signMessage: async (message: SignableMessage) => {
        return await viemParaAccount.signMessage({ message });
      },
      signTypedData: async (typedData) => {
        return await viemParaAccount.signTypedData(typedData);
      },
      signAuthorization: async (authorization) => {
        if (typeof viemParaAccount.signAuthorization === "function") {
          return await viemParaAccount.signAuthorization(authorization);
        }
        throw new Error("signAuthorization is not defined on viemParaAccount");
      },
    };

    const alchemyClient = await createModularAccountV2Client({
      mode: "7702",
      transport: alchemy({
        rpcUrl: ALCHEMY_RPC_URL,
      }),
      chain: arbitrumSepolia,
      signer: paraSigner,
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
    await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    res.status(200).json({
      success: true,
      message: "User operation batch sent successfully using Alchemy + Para with EIP-7702 (pre-generated wallet)",
    });
  } catch (error) {
    console.error("EIP-7702 transaction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && "cause" in error ? error.cause : undefined;
    console.error("Error details:", { message: errorMessage, cause: errorDetails });
    res.status(500).json({
      success: false,
      message: "EIP-7702 transaction failed",
    });
  }
}
