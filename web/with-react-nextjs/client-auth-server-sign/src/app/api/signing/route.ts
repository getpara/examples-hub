import { NextRequest, NextResponse } from "next/server";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";

type RequestBody = {
  session?: string;
  transaction?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { session, transaction } = body as RequestBody;

    if (!session || !transaction) {
      return NextResponse.json(
        { error: "Provide both `session` and `transaction` in the request body." },
        { status: 400 }
      );
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      return NextResponse.json(
        { error: "Set PARA_API_KEY in the environment before using this handler." },
        { status: 500 }
      );
    }

    const txParsed = JSON.parse(transaction);

    const tx = ethers.Transaction.from(txParsed);

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    await para.importSession(session);

    const ethersProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider);

    const signedTx = await paraEthersSigner.signTransaction(tx);

    const txResponse = await ethersProvider.broadcastTransaction(signedTx);

    return NextResponse.json({
      message: "Transaction signed and broadcast successfully",
      signedTransaction: signedTx,
      transactionHash: txResponse.hash,
      transactionResponse: txResponse,
    });
  } catch (error) {
    console.error("Error in transaction signing handler:", error);
    return NextResponse.json(
      { error: "Failed to sign or broadcast transaction", details: (error as Error).message },
      { status: 500 }
    );
  }
}
