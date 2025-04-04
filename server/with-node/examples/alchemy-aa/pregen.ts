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

export async function alchemyPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = req.body.email as string | undefined;

    if (!email) {
      res.status(400).send("Email is required.");
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    const alchemyGasPolicyId = process.env.ALCHEMY_GAS_POLICY_ID;
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC;

    if (!paraApiKey || !alchemyApiKey || !alchemyGasPolicyId || !rpcUrl) {
      res
        .status(500)
        .send(
          "Missing required environment variables (PARA_API_KEY, ALCHEMY_API_KEY, ALCHEMY_GAS_POLICY_ID, ARBITRUM_SEPOLIA_RPC)."
        );
      return;
    }

    const para = new ParaServer(Environment.BETA, paraApiKey);

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email.");
      return;
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).send("Key share not found.");
      return;
    }
    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const viemParaAccount: LocalAccount = createParaAccount(para);

    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(rpcUrl),
    });

    viemClient.signMessage = async ({ message }) => customSignMessage(para, message);

    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountAlchemyClient({
      apiKey: alchemyApiKey,
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      gasManagerConfig: {
        policyId: alchemyGasPolicyId,
      },
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

    res.status(200).json({
      message: "User operation sent using Alchemy + Para with a pre-generated wallet (Viem-based).",
      userOperationResult,
    });
  } catch (error) {
    console.error("Error in alchemyPregenSignHandler:", error);
    next(error);
  }
}
