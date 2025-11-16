import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { encrypt } from "../utils/encryption-utils.js";
import { setKeyShareInDB } from "../db/keySharesDB.js";

const PARA_API_KEY = Bun.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

export async function createWallet(req: Request): Promise<Response> {
  try {
    const { email } = await req.json() as { email?: string };

    if (!email) {
      return Response.json({ success: false, message: "Provide email in the request body" }, { status: 400 });
    }

    if (!PARA_API_KEY) {
      return Response.json({ success: false, message: "PARA_API_KEY is not set" }, { status: 500 });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const walletExists = await para.hasPregenWallet({ pregenId: { email } });

    if (walletExists) {
      return Response.json({ success: false, message: "A pre-generated wallet already exists for this email" }, { status: 409 });
    }

    const wallets = await para.createPregenWalletPerType({
      types: ["EVM", "SOLANA", "COSMOS"],
      pregenId: { email },
    });

    if (!wallets) {
      return Response.json({ success: false, message: "Failed to create pre-generated wallet instance" }, { status: 500 });
    }

    const keyShare = para.getUserShare();
    if (!keyShare) {
      return Response.json({ success: false, message: "Failed to retrieve user share after wallet creation" }, { status: 500 });
    }

    const encryptedKeyShare = await encrypt(keyShare);
    await setKeyShareInDB(email, encryptedKeyShare);

    return Response.json({
      success: true,
      message: "Pre-generated wallets created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating pre-generated wallet:", error);
    return Response.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create pre-generated wallet",
    }, { status: 500 });
  }
}