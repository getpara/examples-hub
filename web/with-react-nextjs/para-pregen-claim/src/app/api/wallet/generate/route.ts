import { v4 as uuidv4 } from "uuid";
import { Environment, Para, WalletType } from "@getpara/server-sdk";
import { walletStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_PARA_API_KEY) {
      throw new Error(
        "NEXT_PUBLIC_PARA_API_KEY is not defined in the environment variables"
      );
    }

    const para = new Para(
      (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) ??
        Environment.BETA,
      process.env.NEXT_PUBLIC_PARA_API_KEY
    );
    const uuid = uuidv4();

    const wallet = await para.createPregenWalletV2({
      type: WalletType.EVM,
      pregenId: { customId: uuid },
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
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
