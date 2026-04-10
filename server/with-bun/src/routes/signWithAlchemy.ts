import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import ParaServer, { Environment } from "@getpara/server-sdk";
import { createParaViemAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { encodeFunctionData, http } from "viem";
import Example from "../contracts/Example.json";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];
const PARA_API_KEY = Bun.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
const ALCHEMY_API_KEY = Bun.env.ALCHEMY_API_KEY;
const ALCHEMY_GAS_POLICY_ID = Bun.env.ALCHEMY_GAS_POLICY_ID;
const ALCHEMY_RPC_URL = Bun.env.ALCHEMY_RPC_URL;

export async function signWithAlchemy(req: Request): Promise<Response> {
  try {
    if (!PARA_API_KEY || !ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID || !ALCHEMY_RPC_URL) {
      return Response.json({
        success: false,
        message: "Missing required environment variables",
      }, { status: 500 });
    }

    const { email } = await req.json() as { email?: string };

    if (!email) {
      return Response.json({
        success: false,
        message: "Missing email in request body",
      }, { status: 400 });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });

    if (!hasPregenWallet) {
      return Response.json({
        success: false,
        message: "No pre-generated wallet found for this email",
      }, { status: 400 });
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      return Response.json({
        success: false,
        message: "Key share not found for this email",
      }, { status: 400 });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const viemParaAccount = createParaViemAccount({ para });

    const viemClient = createParaViemClient({ para, walletClientConfig: {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(ALCHEMY_RPC_URL),
    } });

    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountAlchemyClient({
      transport: alchemy({
        rpcUrl: ALCHEMY_RPC_URL,
      }),
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      policyId: ALCHEMY_GAS_POLICY_ID,
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

    console.log("Alchemy Pregen - User operation result:", userOperationResult);

    await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    return Response.json({
      success: true,
      message: "User operation batch sent successfully using Alchemy + Para with pre-generated wallet",
    }, { status: 200 });
  } catch (error) {
    console.error("Alchemy pregen transaction error:", error);
    return Response.json({
      success: false,
      message: "Transaction failed",
    }, { status: 500 });
  }
}