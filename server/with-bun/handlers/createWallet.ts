import { Para as ParaServer, Environment, WalletType } from "@getpara/server-sdk";
import { encrypt } from "../utils/encryption-utils";
import { setKeyShareInDB } from "../db/keySharesDB";

export const createWallet = async (req: Request): Promise<Response> => {
  const { email } = (await req.json()) as { email: string };

  if (!email) {
    return new Response("Email is required in the request body", { status: 400 });
  }

  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    console.error("PARA_API_KEY environment variable is not set.");
    return new Response("Server configuration error: PARA_API_KEY not set", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY, { disableWebSockets: true, disableWorkers: true });

  try {
    const hasPregenWallet = await para.hasPregenWallet({
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });
    if (hasPregenWallet) {
      console.warn(`Wallet creation attempt for existing email: ${email}`);
      return new Response(`Wallet already exists for ${email}`, { status: 409 });
    }

    const wallet = await para.createPregenWallet({
      type: WalletType.EVM,
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });
    if (!wallet) {
      console.error(`Para SDK returned no wallet object for ${email}, but no error was thrown.`);
      return new Response("Failed to create wallet (unknown reason)", { status: 500 });
    }

    const keyShare = para.getUserShare();
    if (!keyShare) {
      console.error(`Failed to get key share immediately after creating wallet for ${email}`);
      return new Response("Failed to retrieve key share after wallet creation", { status: 500 });
    }

    let encryptedKeyShare: string;

    try {
      encryptedKeyShare = await encrypt(keyShare);
    } catch (encError) {
      console.error(`Failed to encrypt key share for ${email}:`, encError);
      return new Response("Failed to secure key share", { status: 500 });
    }

    setKeyShareInDB(email, encryptedKeyShare);

    return new Response(`Wallet created successfully for ${email}`, { status: 201 });
  } catch (error) {
    console.error(`Error during wallet creation process for ${email}:`, error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return new Response(`Wallet already exists for ${email}`, { status: 409 });
    }
    return new Response(`Failed to create wallet: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
