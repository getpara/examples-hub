import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB.js";
import { decrypt } from "../utils/encryption-utils.js";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Environment variables
const PARA_API_KEY = Bun.env.PARA_API_KEY;
const PARA_ENVIRONMENT = (Bun.env.PARA_ENVIRONMENT as Environment) || Environment.BETA;

export const signWithSolanaWeb3 = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const email = body.email as string | undefined;

    if (!email) {
      return Response.json({ success: false, message: "Provide email in the request body" }, { status: 400 });
    }

    if (!PARA_API_KEY) {
      return Response.json({ success: false, message: "PARA_API_KEY is not set" }, { status: 500 });
    }

    const para = new ParaServer(PARA_ENVIRONMENT, PARA_API_KEY);

    const hasPregenWallet = await para.hasPregenWallet({ pregenId: { email } });
    if (!hasPregenWallet) {
      return Response.json({ success: false, message: "No pre-generated wallet found for this email" }, { status: 400 });
    }

    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      return Response.json({ success: false, message: "Key share not found" }, { status: 400 });
    }

    const decryptedKeyShare = await decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    const connection = new Connection(clusterApiUrl("testnet"));
    const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

    if (!solanaSigner.sender) {
      return Response.json({ success: false, message: "Failed to initialize Solana sender address from Para wallet" }, { status: 500 });
    }

    const demoTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: solanaSigner.sender,
        lamports: LAMPORTS_PER_SOL / 1000, // Example: 0.001 SOL
      })
    );

    const signedTransaction = await solanaSigner.signTransaction(demoTx);

    console.log("Solana Pregen - Signed transaction:", signedTransaction);

    return Response.json({
      success: true,
      message: "Transaction signed using Solana-Web3 + Para (pre-generated wallet)"
    });
  } catch (error) {
    console.error("Error in solanaPregenSignHandler:", error);
    return Response.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to sign transaction" 
    }, { status: 500 });
  }
};
