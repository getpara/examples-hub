import { Handler } from "@std/http";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { sepolia } from "viem/chains";
import { http, parseEther, parseGwei } from "viem";

// Environment variables
const PARA_API_KEY = Deno.env.get("PARA_API_KEY");
const PARA_ENVIRONMENT = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;

export const signWithViem: Handler = async (req: Request): Promise<Response> => {
  try {
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: "Email is required in the request body" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!PARA_API_KEY) {
      return new Response(JSON.stringify({ success: false, message: "PARA_API_KEY is not set" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });

    if (!hasPregenWallet) {
      return new Response(JSON.stringify({ success: false, message: `No pre-generated wallet found for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const keyShare = await getKeyShareInDB(email);

    if (!keyShare) {
      return new Response(JSON.stringify({ success: false, message: `Key share not found in DB for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const viemParaAccount = createParaAccount(para);

    // @ts-ignore - Deno npm module duplication issue with viem types
    const viemClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    });

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

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Transaction signed using Viem + Para (pre-generated wallet)" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in signWithViem:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to sign transaction" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
