import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { sepolia } from "viem/chains";
import { http, parseEther, parseGwei, createPublicClient } from "viem";
import type { WalletClient } from "viem";

export const signWithViem = async (req: Request): Promise<Response> => {
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
  const transport = http("https://ethereum-sepolia-rpc.publicnode.com");
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: transport,
  });

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

    const viemParaAccount = await createParaAccount(para);

    if (!viemParaAccount || !viemParaAccount.address) {
      throw new Error("Failed to create Viem account from Para instance.");
    }

    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: sepolia,
      transport: transport,
    });

    const nonce = await publicClient.getTransactionCount({
      address: viemParaAccount.address,
      blockTag: "pending",
    });

    const demoTx = {
      account: viemParaAccount,
      to: viemParaAccount.address,
      value: parseEther("0.001"),
      gas: 21000n,
      maxFeePerGas: parseGwei("20"),
      maxPriorityFeePerGas: parseGwei("2"),
      nonce: nonce,
      chain: sepolia,
      maxFeePerBlobGas: 0n,
      blobs: [],
    };

    const signatureResult = await viemClient.signTransaction(demoTx);

    return new Response(JSON.stringify({ route: "signWithViem", signatureResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error during signWithViem process for ${email}:`, error);
    return new Response(`Failed to sign with Viem: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
