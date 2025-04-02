import { Para as ParaServer, Environment, WalletType, PregenIdentifierType } from "@getpara/server-sdk";
import { simulateVerifyToken } from "../utils/auth-utils";
import { encrypt } from "../utils/encryption-utils";
import { setKeyShareInDB } from "../db/keySharesDB";

/**
 * Handles the creation of a wallet for the provided email.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response to be sent back.
 */
export const createWallet = async (req: Request): Promise<Response> => {
  // Extract and validate Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use your own token verification logic here
  const token = authHeader.split(" ")[1];
  const user = simulateVerifyToken(token);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Parse the request body
  const { email } = (await req.json()) as RequestBody;
  if (user.email !== email) {
    return new Response("Forbidden", { status: 403 });
  }

  // Ensure PARA_API_KEY is available
  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    return new Response("PARA_API_KEY not set", { status: 500 });
  }

  // Initialize Para client
  const para = new ParaServer(Environment.BETA, PARA_API_KEY);

  // Check if a pre-generated wallet already exists
  const hasPregenWallet = await para.hasPregenWalletV2({ pregenId: { email }});
  if (hasPregenWallet) {
    return new Response("Wallet already exists", { status: 400 });
  }

  // Create a new wallet
  const wallet = await para.createPregenWalletV2({
    type: WalletType.EVM,
    pregenId: { email },
  });
  if (!wallet) {
    return new Response("Failed to create wallet", { status: 500 });
  }

  // Retrieve and encrypt the key share
  const keyShare = para.getUserShare();
  if (!keyShare) {
    return new Response("Failed to get key share", { status: 500 });
  }

  const encryptedKeyShare = encrypt(keyShare);

  // Store the encrypted key share in the database
  await setKeyShareInDB(email, encryptedKeyShare);

  //Return a response
  return new Response(`Wallet created for ${email}`, { status: 201 });
};
