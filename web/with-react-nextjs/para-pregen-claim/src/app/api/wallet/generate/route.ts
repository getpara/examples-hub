import { v4 as uuidv4 } from "uuid";
import { walletStore } from "@/lib/store";
import { getParaClient } from "@/lib/para/client";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const para = getParaClient();
    const uuid = uuidv4();

    const hasPregenWallet = await para.hasPregenWallet({
      pregenId: { customId: uuid },
    });

    if (hasPregenWallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet already exists",
      });
    }

    const wallet = await para.createPregenWallet({
      type: "EVM",
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
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
