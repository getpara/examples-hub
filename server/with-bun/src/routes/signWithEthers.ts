import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";
import { createParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";

const PARA_API_KEY = Bun.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

export const signWithEthers = async (req: Request): Promise<Response> => {
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

    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const paraEthersSigner = createParaEthersSigner({ para, provider: ethersProvider as ethers.Provider });

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

    return Response.json({
      success: true,
      message: "Transaction signed using Ethers + Para (pre-generated wallet)",
    });
  } catch (error) {
    console.error("Error in ethersPregenSignHandler:", error);
    return Response.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to sign transaction",
    }, { status: 500 });
  }
};
