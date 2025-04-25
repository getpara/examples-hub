import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { sepolia } from "viem/chains";
import { http, parseEther, parseGwei } from "viem";

export const signWithViem = async (req: Request): Promise<Response> => {
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

    const viemParaAccount = createParaAccount(para);
    const viemClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    });

    const request = await viemClient.prepareTransactionRequest({
      account: viemParaAccount,
      to: viemParaAccount.address,
      value: parseEther("0.0001"),
      gas: 21000n,
      maxFeePerGas: parseGwei("20"),
      maxPriorityFeePerGas: parseGwei("3"),
      chain: sepolia,
    });

    const signedTxRlp = await viemClient.signTransaction(request);

    return new Response(JSON.stringify({ route: "signWithViem", signedTxRlp }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(`Error in signWithViem: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
