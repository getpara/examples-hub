import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment, SuccessfulSignatureRes, hexStringToBase64 } from "@getpara/server-sdk";
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

export async function alchemySessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = req.body.session as string | undefined;

    if (!session) {
      res.status(400).send("Session is required.");
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
    await para.importSession(session);

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
      message: "Sent user operation using Alchemy + Para (session-based wallet, viem-based).",
      userOperationResult,
    });
  } catch (error) {
    console.error("Error in alchemySessionSignHandler:", error);
    next(error);
  }
}
