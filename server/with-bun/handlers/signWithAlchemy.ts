import { Para as ParaServer, hexStringToBase64, Environment } from "@getpara/server-sdk";
import type { SuccessfulSignatureRes } from "@getpara/server-sdk";
import { decrypt } from "../utils/encryption-utils";
import { getKeyShareInDB } from "../db/keySharesDB";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { http, encodeFunctionData, hashMessage } from "viem";
import type { WalletClient, LocalAccount, SignableMessage, Hash, Chain } from "viem";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { WalletClientSigner, arbitrumSepolia } from "@alchemy/aa-core";
import Example from "../artifacts/Example.json";
import type { BatchUserOperationCallData, SendUserOperationResult } from "@alchemy/aa-core";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";

async function customSignMessage(para: ParaServer, message: SignableMessage): Promise<Hash> {
  try {
    const hashedMessage = hashMessage(message);
    const walletId = Object.values(para.wallets!)[0]!.id;

    const res = await para.signMessage({
      walletId: walletId,
      messageBase64: hexStringToBase64(hashedMessage),
    });

    if ("error" in res) {
      throw new Error(`Para signMessage failed: ${res.error}`);
    }

    let signature = (res as SuccessfulSignatureRes).signature;
    const lastByte = parseInt(signature.slice(-2), 16);

    if (lastByte < 27) {
      const adjustedV = (lastByte + 27).toString(16).padStart(2, "0");
      signature = signature.slice(0, -2) + adjustedV;
    }

    return `0x${signature}`;
  } catch (error) {
    console.error("Error in customSignMessage:", error);
    throw new Error(`Failed during custom sign message: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const signWithAlchemy = async (req: Request): Promise<Response> => {
  const { email }: { email: string } = await req.json();

  if (!email) {
    return new Response("Email is required in the request body", { status: 400 });
  }

  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  const ALCHEMY_API_KEY = Bun.env.ALCHEMY_API_KEY;
  const ALCHEMY_GAS_POLICY_ID = Bun.env.ALCHEMY_GAS_POLICY_ID;

  if (!PARA_API_KEY) {
    console.error("Server configuration error: PARA_API_KEY not set");
    return new Response("Server configuration error", { status: 500 });
  }

  if (!ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID) {
    console.error("Server configuration error: ALCHEMY_API_KEY or ALCHEMY_GAS_POLICY_ID not set");
    return new Response("Server configuration error", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY, { disableWebSockets: true, disableWorkers: true });

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

    // Check if wallets loaded after setting share
    if (!para.wallets || Object.keys(para.wallets).length === 0) {
      throw new Error("Failed to load wallet details after setting user share.");
    }

    const viemParaAccount: LocalAccount = await createParaAccount(para);
    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia as Chain,
      transport: http("https://arbitrum-sepolia.public.blastapi.io"),
    });

    viemClient.signMessage = async ({ message }: { message: SignableMessage }): Promise<Hash> => {
      // sometimes we need to override the signMessage do to Para's threshold signing not having the v byte
      return customSignMessage(para, message);
    };

    const walletClientSigner: WalletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountAlchemyClient({
      apiKey: ALCHEMY_API_KEY,
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      gasManagerConfig: {
        policyId: ALCHEMY_GAS_POLICY_ID,
      },
    });

    const demoUserOperations: BatchUserOperationCallData = [1, 2, 3, 4, 5].map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: Example.contracts["contracts/Example.sol:Example"].abi,
        functionName: "changeX",
        args: [x],
      }),
      value: 0n,
    }));

    const userOperationResult: SendUserOperationResult = await alchemyClient.sendUserOperation({
      uo: demoUserOperations,
    });

    return new Response(JSON.stringify({ route: "signWithAlchemy", userOperationResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error during signWithAlchemy process for ${email}:`, error);
    return new Response(`Failed to sign with Alchemy: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
