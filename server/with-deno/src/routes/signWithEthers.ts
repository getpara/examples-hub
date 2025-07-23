import { Handler } from "@std/http";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";

const PARA_API_KEY = Deno.env.get("PARA_API_KEY");
const PARA_ENVIRONMENT = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;

export const signWithEthers: Handler = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const email = body.email as string | undefined;

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: "Provide email in the request body" }), {
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
      return new Response(JSON.stringify({ success: false, message: "No pre-generated wallet found for this email" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      return new Response(JSON.stringify({ success: false, message: "Key share not found" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }
    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    // @ts-ignore - Deno npm module duplication issue with ethers types
    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider as ethers.Provider);

    const address = await paraEthersSigner.getAddress();
    const feeData = await ethersProvider.getFeeData();
    const nonce = await ethersProvider.getTransactionCount(address);

    const tx = {
      to: address,
      value: ethers.parseEther("0.0001"),
      nonce: nonce,
      gasLimit: 21000,
      gasPrice: feeData.gasPrice,
    };

    const signedTx = await paraEthersSigner.signTransaction(tx);

    console.log("Ethers Pregen - Signed transaction:", signedTx);

    return new Response(JSON.stringify({
      success: true,
      message: "Transaction signed using Ethers + Para (pre-generated wallet)",
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in ethersPregenSignHandler:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : "Failed to sign transaction",
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};