import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment, SuccessfulSignatureRes, hexStringToBase64 } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { hashMessage, http } from "viem";
import type { WalletClient, LocalAccount, SignableMessage, Hash } from "viem";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { BatchUserOperationCallData, WalletClientSigner, arbitrumSepolia } from "@alchemy/aa-core";
import { encodeFunctionData } from "viem";
import Example from "../../artifacts/Example.json" assert { type: "json" };

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";

export async function alchemyPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).send("Email is required.");
      return;
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
    const ALCHEMY_GAS_POLICY_ID = process.env.ALCHEMY_GAS_POLICY_ID;
    const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC;

    if (!PARA_API_KEY) {
      res.status(500).send("PARA_API_KEY is not set.");
      return;
    }

    if (!ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID) {
      res.status(500).send("ALCHEMY_API_KEY or ALCHEMY_GAS_POLICY_ID is not set.");
      return;
    }

    if (!RPC_URL) {
      res.status(500).send("RPC_URL is not set.");
      return;
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email. Ask the user to create one first.");
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).send("Key share not found. Ensure the wallet initialization process was completed.");
      return;
    }

    const decryptedKeyShare = decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const viemParaAccount: LocalAccount = createParaAccount(para);
    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(RPC_URL),
    });

    viemClient.signMessage = async ({ message }: { message: SignableMessage }): Promise<Hash> => {
      return customSignMessage(para, message);
    };

    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountAlchemyClient({
      apiKey: ALCHEMY_API_KEY,
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      gasManagerConfig: {
        policyId: ALCHEMY_GAS_POLICY_ID,
      },
    });

    const demoUserOperations: BatchUserOperationCallData = [1, 2, 3, 4, 5].map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: Example["contracts"]["contracts/Example.sol:Example"]["abi"],
        functionName: "changeX",
        args: [x],
      }),
    }));

    const userOperationResult = await alchemyClient.sendUserOperation({ uo: demoUserOperations });

    res.status(200).json({
      message: "User operation sent using Alchemy + Para with a pre-generated wallet (Viem-based).",
      userOperationResult,
    });
  } catch (error) {
    console.error("Error in alchemyPregenSignHandler:", error);
    next(error);
  }
}

async function customSignMessage(para: ParaServer, message: SignableMessage): Promise<Hash> {
  const hashedMessage = hashMessage(message);

  const res = await para.signMessage({
    walletId: Object.values(para.wallets!)[0]!.id,
    messageBase64: hexStringToBase64(hashedMessage),
  });
  let signature = (res as SuccessfulSignatureRes).signature;

  const lastByte = parseInt(signature.slice(-2), 16);
  if (lastByte < 27) {
    const adjustedV = (lastByte + 27).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedV;
  }

  return `0x${signature}`;
}
