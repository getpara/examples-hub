import { Para as ParaServer, Environment, WalletType } from "@getpara/server-sdk";
import { encrypt } from "../utils/encryption-utils";
import { setKeyShareInDB } from "../db/keySharesDB";

export const createWallet = async (req: Request): Promise<Response> => {
  try {
    const { email } = (await req.json()) as { email: string };

    if (!email) {
      return new Response("Email is required in the request body", { status: 400 });
    }

    const paraApiKey = Bun.env.PARA_API_KEY;
    const env = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

    if (!paraApiKey) {
      return new Response("Server configuration error: PARA_API_KEY not set", { status: 500 });
    }

    const para = new ParaServer(env, paraApiKey, { disableWebSockets: true });

    const hasPregenWallet = await para.hasPregenWallet({
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });

    if (hasPregenWallet) {
      return new Response(`Wallet already exists for ${email}`, { status: 409 });
    }

    const wallets = await para.createPregenWalletPerType({
      types: [WalletType.EVM, WalletType.SOLANA, WalletType.COSMOS], // Select the wallet type you want to create or use createPregenWallet() to create a single type.
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });

    if (!wallets) {
      console.error(`Para SDK returned no wallet object for ${email}, but no error was thrown.`);
      return new Response("Failed to create wallet (unknown reason)", { status: 500 });
    }

    const keyShare = para.getUserShare();

    if (!keyShare) {
      return new Response("Failed to retrieve key share after wallet creation", { status: 500 });
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
    return new Response("Failed to create wallet", { status: 500 });
  }
};
