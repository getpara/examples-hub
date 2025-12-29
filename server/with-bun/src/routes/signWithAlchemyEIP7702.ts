import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { BatchUserOperationCallData, WalletClientSigner } from "@aa-sdk/core";
import ParaServer, { Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { encodeFunctionData, http } from "viem";
import Example from "../contracts/Example.json";

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";
const EXAMPLE_ABI = Example["contracts"]["contracts/Example.sol:Example"]["abi"];
const PARA_API_KEY = Bun.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;
const ALCHEMY_API_KEY = Bun.env.ALCHEMY_API_KEY;
const ALCHEMY_GAS_POLICY_ID = Bun.env.ALCHEMY_GAS_POLICY_ID;
const ALCHEMY_RPC_URL = Bun.env.ALCHEMY_RPC_URL;

export const signWithAlchemyEIP7702 = async (req: Request): Promise<Response> => {
  try {
    if (!PARA_API_KEY || !ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID || !ALCHEMY_RPC_URL) {
      return Response.json({
        success: false,
        message: "Missing required environment variables",
      }, { status: 500 });
    }

    const body = await req.json();
    const session = body.session as string | undefined;

    if (!session) {
      return Response.json({
        success: false,
        message: "Missing session in request body",
      }, { status: 400 });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    await para.importSession(session);

    const viemParaAccount = createParaAccount(para);

    const viemClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http(ALCHEMY_RPC_URL),
    });

    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    const alchemyClient = await createModularAccountV2Client({
      mode: "7702",
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

    const userOperationResult = await alchemyClient.sendUserOperation({
      uo: demoUserOperations,
    });

    console.log("Alchemy EIP-7702 - User operation result:", userOperationResult);

    await alchemyClient.waitForUserOperationTransaction(userOperationResult);

    return Response.json({
      success: true,
      message: "User operation batch sent successfully using Alchemy + Para with EIP-7702",
    });
  } catch (error) {
    console.error("EIP-7702 transaction error:", error);
    return Response.json({
      success: false,
      message: "EIP-7702 transaction failed",
    }, { status: 500 });
  }
};