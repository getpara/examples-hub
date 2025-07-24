import { Handler } from "@std/http";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { encrypt } from "../utils/encryption-utils.ts";
import { setKeyShareInDB } from "../db/keySharesDB.ts";

const PARA_API_KEY = Deno.env.get("PARA_API_KEY");
const PARA_ENVIRONMENT = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;

export const createWallet: Handler = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const email = body.email as string | undefined;

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: "Provide email in the request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!PARA_API_KEY) {
      return new Response(JSON.stringify({ success: false, message: "PARA_API_KEY is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const walletExists = await para.hasPregenWallet({ pregenId: { email } });

    if (walletExists) {
      return new Response(JSON.stringify({ success: false, message: "A pre-generated wallet already exists for this email" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const wallets = await para.createPregenWalletPerType({
      types: ["EVM", "SOLANA", "COSMOS"],
      pregenId: { email },
    });

    if (!wallets) {
      return new Response(JSON.stringify({ success: false, message: "Failed to create pre-generated wallet instance" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const keyShare = para.getUserShare();
    if (!keyShare) {
      return new Response(JSON.stringify({ success: false, message: "Failed to retrieve user share after wallet creation" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encryptedKeyShare = await encrypt(keyShare);
    await setKeyShareInDB(email, encryptedKeyShare);

    return new Response(JSON.stringify({
      success: true,
      message: "Pre-generated wallets created successfully",
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating pre-generated wallet:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create pre-generated wallet",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};