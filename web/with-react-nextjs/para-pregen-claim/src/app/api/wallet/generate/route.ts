import { v4 as uuidv4 } from "uuid";
import { Environment, Para, WalletType } from "@getpara/server-sdk";
import { walletStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.PARA_API_KEY) {
      throw new Error("PARA_API_KEY is not defined in the environment variables");
    }

    const para = new Para(Environment.BETA, process.env.PARA_API_KEY);
    const uuid = uuidv4();

    const wallet = await para.createPregenWallet({
      type: WalletType.EVM,
      pregenIdentifier: uuid,
      pregenIdentifierType: "CUSTOM_ID",
    });

    const userShare = await para.getUserShare();

    if (!wallet || !userShare) {
      throw new Error("Failed to generate wallet or user share");
    }

    walletStore.storeWallet(uuid, wallet, userShare);

    return NextResponse.json({
      success: true,
      uuid,
      wallet: {
        address: wallet.address,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
