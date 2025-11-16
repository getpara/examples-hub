import { Handler } from "@std/http";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.ts";
import { decrypt } from "../utils/encryption-utils.ts";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Environment variables
const PARA_API_KEY = Deno.env.get("PARA_API_KEY");
const PARA_ENVIRONMENT = (Deno.env.get("PARA_ENVIRONMENT") as Environment) || Environment.BETA;

export const signWithSolanaWeb3: Handler = async (req: Request): Promise<Response> => {
  try {
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: "Email is required in the request body" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!PARA_API_KEY) {
      return new Response(JSON.stringify({ success: false, message: "PARA_API_KEY is not set" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });

    if (!hasPregenWallet) {
      return new Response(JSON.stringify({ success: false, message: `No pre-generated wallet found for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const keyShare = await getKeyShareInDB(email);

    if (!keyShare) {
      return new Response(JSON.stringify({ success: false, message: `Key share not found in DB for ${email}` }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

    if (!solanaSigner.sender) {
      return new Response(JSON.stringify({ success: false, message: "Failed to initialize Solana sender address from Para wallet" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
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

    console.log("Solana Web3 Pregen - Signed transaction:", signedTransaction);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Transaction signed using Solana Web3.js + Para (pre-generated wallet)",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in signWithSolanaWeb3:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to sign transaction" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
