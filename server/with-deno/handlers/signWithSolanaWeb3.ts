import { Handler } from "@std/http";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const signWithSolanaWeb3: Handler = async (req: Request): Promise<Response> => {
  try {
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response("Email is required in the request body", { status: 400 });
    }

    const paraApiKey = Deno.env.get("PARA_API_KEY");

    if (!paraApiKey) {
      console.error("Server configuration error: PARA_API_KEY not set");
      return new Response("Server configuration error", { status: 500 });
    }

    const env = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;
    const para = new ParaServer(env, paraApiKey, { disableWebSockets: true });

    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });

    if (!hasPregenWallet) {
      return new Response(`Pregenerated wallet does not exist for ${email}`, { status: 404 });
    }

    const keyShare = await getKeyShareInDB(email);

    if (!keyShare) {
      return new Response(`Key share not found in DB for ${email}`, { status: 404 });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

    if (!solanaSigner.sender) {
      return new Response("Failed to initialize Solana sender address from Para wallet.", { status: 500 });
    }

    const demoTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: solanaSigner.sender,
        lamports: LAMPORTS_PER_SOL / 1000, // Example: 0.001 SOL
      })
    );

    demoTx.feePayer = solanaSigner.sender;
    demoTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signedTransaction = await solanaSigner.signTransaction(demoTx);

    return new Response(
      JSON.stringify({
        route: "signWithSolanaWeb3",
        signedTransaction,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
  }
};
