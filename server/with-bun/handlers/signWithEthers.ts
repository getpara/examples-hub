import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";

export const signWithEthers = async (req: Request): Promise<Response> => {
  try {
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response("Email is required in the request body", { status: 400 });
    }

    const paraApiKey = Bun.env.PARA_API_KEY;
    if (!paraApiKey) {
      return new Response("Server configuration error", { status: 500 });
    }

    const env = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
    const para = new ParaServer(env, paraApiKey, { disableWebSockets: true });

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });

    if (!hasPregenWallet) {
      return new Response(`Pregenerated wallet does not exist for ${email}`, { status: 404 });
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      return new Response(`Key share not found in DB for ${email}`, { status: 404 });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider);

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

    return new Response(JSON.stringify({ route: "signWithEthers", signedTx }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
