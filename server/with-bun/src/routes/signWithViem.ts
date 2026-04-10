import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";
import { createParaViemAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { sepolia } from "viem/chains";
import { http, parseEther, parseGwei } from "viem";

// Environment variables
const PARA_API_KEY = Bun.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

export const signWithViem = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const email = body.email as string | undefined;

    if (!email) {
      return Response.json({ success: false, message: "Provide email in the request body" }, { status: 400 });
    }

    if (!PARA_API_KEY) {
      return Response.json({ success: false, message: "PARA_API_KEY is not set" }, { status: 500 });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });
    if (!hasPregenWallet) {
      return Response.json({ success: false, message: "No pre-generated wallet found for this email" }, { status: 400 });
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      return Response.json({ success: false, message: "Key share not found" }, { status: 400 });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const viemParaAccount = createParaViemAccount({ para });
    const viemClient = createParaViemClient({ para, walletClientConfig: {
      account: viemParaAccount,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    } });

    const request = await viemClient.prepareTransactionRequest({
      account: viemParaAccount,
      to: viemParaAccount.address,
      value: parseEther("0.0001"),
      gas: BigInt(21000),
      maxFeePerGas: parseGwei("20"),
      maxPriorityFeePerGas: parseGwei("3"),
      chain: sepolia,
    });

    const signedTxRlp = await viemClient.signTransaction(request);

    console.log("Viem Pregen - Signed transaction RLP:", signedTxRlp);

    return Response.json({
      success: true,
      message: "Transaction signed using Viem + Para (pre-generated wallet)"
    });
  } catch (error) {
    console.error("Error in viemPregenSignHandler:", error);
    return Response.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to sign transaction" 
    }, { status: 500 });
  }
};
