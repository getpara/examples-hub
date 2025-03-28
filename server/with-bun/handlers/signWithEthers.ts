import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import type { TransactionRequest } from "ethers";

export const signWithEthers = async (req: Request): Promise<Response> => {
  const { email }: { email: string } = await req.json();

  if (!email) {
    return new Response("Email is required in the request body", { status: 400 });
  }

  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    console.error("Server configuration error: PARA_API_KEY not set");
    return new Response("Server configuration error", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY, { disableWebSockets: true, disableWorkers: true });
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

  try {
    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      return new Response(`Pregenerated wallet does not exist for ${email}`, { status: 404 });
    }

    const keyShare = getKeyShareInDB(email);
    if (!keyShare) {
      return new Response(`Key share not found in DB for ${email}`, { status: 404 });
    }

    let decryptedKeyShare: string;
    try {
      decryptedKeyShare = await decrypt(keyShare);
    } catch (decryptionError) {
      console.error(`Failed to decrypt key share for ${email}:`, decryptionError);
      return new Response("Failed to process key share", { status: 500 });
    }

    await para.setUserShare(decryptedKeyShare);

    if (!para.wallets || Object.keys(para.wallets).length === 0) {
      throw new Error("Failed to load wallet details after setting user share.");
    }

    const paraEthersSigner = new ParaEthersSigner(para, provider);
    const address = await paraEthersSigner.getAddress();
    if (!address) {
      throw new Error("Failed to get address from ParaEthersSigner.");
    }

    const nonce = await provider.getTransactionCount(address);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (gasPrice === null) {
      throw new Error("Failed to retrieve gas price from provider.");
    }

    const demoTx: TransactionRequest = {
      to: address,
      from: address,
      value: ethers.parseEther("0.001"),
      nonce: nonce,
      gasLimit: 21000,
      gasPrice: gasPrice,
      chainId: 11155111,
    };

    const signTransactionResult = await paraEthersSigner.signTransaction(demoTx);

    return new Response(JSON.stringify({ route: "signWithEthers", signTransactionResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error during signWithEthers process for ${email}:`, error);
    return new Response(`Failed to sign with Ethers: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
