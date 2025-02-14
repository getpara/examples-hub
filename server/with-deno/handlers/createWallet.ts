import { Handler } from "@std/http";
import { Para as ParaServer, Environment, WalletType, PregenIdentifierType } from "@getpara/server-sdk";

import { simulateVerifyToken } from "../utils/auth-utils.ts";
import { encrypt } from "../utils/encryption-utils.ts";
import { setKeyShareInDB } from "../db/keySharesDB.ts";

interface RequestBody {
  email: string;
}

export const createWallet: Handler = async (req: Request): Promise<Response> => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  // Simulate verifying the token. In a real app, you would verify a JWT token.
  const user = simulateVerifyToken(token);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { email }: RequestBody = await req.json();

  if (user.email !== email) {
    return new Response("Forbidden", { status: 403 });
  }

  const PARA_API_KEY = Deno.env.get("PARA_API_KEY");

  if (!PARA_API_KEY) {
    return new Response("PARA_API_KEY not set", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY);

  const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });

  if (hasPregenWallet) {
    return new Response("Wallet already exists", { status: 400 });
  }

  const wallet = await para.createPregenWallet({
    type: WalletType.EVM,
    pregenIdentifier: email,
    pregenIdentifierType: "EMAIL",
  });

  if (!wallet) {
    return new Response("Failed to create wallet", { status: 500 });
  }

  const keyShare = para.getUserShare();

  if (!keyShare) {
    return new Response("Failed to get key share", { status: 500 });
  }

  const encryptedKeyShare = encrypt(keyShare);

  await setKeyShareInDB(email, encryptedKeyShare);

  return new Response(`Wallet created for ${email}`, { status: 201 });
};
