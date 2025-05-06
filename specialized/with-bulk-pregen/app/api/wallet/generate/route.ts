import { Environment, Para, WalletType } from "@getpara/server-sdk";
import { walletStore } from "@/lib/store";
import { NextResponse } from "next/server";

interface GenerateWalletRequestBody {
  handle: string;
  type: "TWITTER" | "TELEGRAM";
}

export async function POST(request: Request) {
  try {
    if (!process.env.PARA_API_KEY) {
      throw new Error("PARA_API_KEY is not defined in the environment variables");
    }

    const body: GenerateWalletRequestBody = await request.json();
    const { handle, type } = body;

    if (!handle || typeof handle !== "string" || handle.trim() === "") {
      throw new Error("Invalid or missing 'handle' in request body");
    }

    if (!type || (type !== "TWITTER" && type !== "TELEGRAM")) {
      throw new Error("Invalid or missing 'type' in request body. Must be 'twitter' or 'telegram'.");
    }

    const para = new Para(Environment.BETA, process.env.PARA_API_KEY);

    const wallet = await para.createPregenWallet({
      type: WalletType.EVM,
      pregenIdentifier: handle.trim(),
      pregenIdentifierType: type,
    });

    const userShare = await para.getUserShare();

    if (!wallet || !userShare) {
      throw new Error("Failed to generate wallet or user share via Para SDK");
    }

    walletStore.storeWallet(handle.trim(), wallet, userShare);

    return NextResponse.json({
      success: true,
      handle: handle.trim(),
      wallet: {
        address: wallet.address,
      },
    });
  } catch (error) {
    console.error("Error in /api/wallet/generate:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
