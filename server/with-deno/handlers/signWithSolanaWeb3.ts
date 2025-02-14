import { Handler } from "@std/http";
import { simulateVerifyToken } from "../utils/auth-utils.ts";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface RequestBody {
  email: string;
}

export const signWithSolanaWeb3: Handler = async (req: Request): Promise<Response> => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = authHeader.split(" ")[1];

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

  if (!hasPregenWallet) {
    return new Response("Wallet does not exist", { status: 400 });
  }

  const keyShare = getKeyShareInDB(email);

  if (!keyShare) {
    return new Response("Key share does not exist", { status: 400 });
  }

  const decryptedKeyShare = decrypt(keyShare);

  await para.setUserShare(decryptedKeyShare);

  const solanaConnection = new Connection(clusterApiUrl("testnet"));

  const solanaSigner = new ParaSolanaWeb3Signer(para, solanaConnection);

  const demoTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: solanaSigner.sender!,
      toPubkey: solanaSigner.sender!,
      lamports: LAMPORTS_PER_SOL / 100,
    })
  );

  const signatureResult = await solanaSigner.signTransaction(demoTx);

  return new Response(JSON.stringify({ route: "signWithSolanaWeb3", signatureResult }), { status: 200 });
};
