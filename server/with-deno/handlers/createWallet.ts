import { Para as ParaServer, Environment, WalletType } from "@getpara/server-sdk";
import { encrypt } from "../utils/encryption-utils.ts";
import { setKeyShareInDB } from "../db/keySharesDB.ts";
import { Handler } from "@std/http";

export const createWallet: Handler = async (req: Request): Promise<Response> => {
  try {
    const { email } = (await req.json()) as { email: string };

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required in the request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const paraApiKey = Deno.env.get("PARA_API_KEY");
    const envString = Deno.env.get("PARA_ENVIRONMENT") || "BETA";
    const env = envString as Environment;

    if (!paraApiKey) {
      return new Response(JSON.stringify({ error: "Server configuration error: PARA_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const para = new ParaServer(env, paraApiKey, { disableWebSockets: true });

    const hasPregenWallet = await para.hasPregenWallet({
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });

    if (hasPregenWallet) {
      return new Response(JSON.stringify({ error: `Wallet already exists for ${email}` }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const wallets = await para.createPregenWalletPerType({
      types: [WalletType.EVM, WalletType.SOLANA, WalletType.COSMOS],
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });

    if (!wallets) {
      console.error(`Para SDK returned no wallet object for ${email}, but no error was thrown.`);
      return new Response(JSON.stringify({ error: "Failed to create wallet (unknown reason)" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const keyShare = para.getUserShare();

    if (!keyShare) {
      return new Response(JSON.stringify({ error: "Failed to retrieve key share after wallet creation" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encryptedKeyShare = await encrypt(keyShare);
    setKeyShareInDB(email, encryptedKeyShare);

    return new Response(
      JSON.stringify({
        message: "Pre-generated wallets created successfully.",
        addresses: wallets.map((wallet) => wallet.address),
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating pre-generated wallet:", error);
    return new Response(JSON.stringify({ error: "Failed to create wallet" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
