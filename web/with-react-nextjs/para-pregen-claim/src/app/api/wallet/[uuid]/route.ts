import { NextRequest, NextResponse } from "next/server";
import { walletStore } from "@/lib/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
): Promise<NextResponse> {
  try {
    const { uuid } = await params;

    if (!uuid) {
      return NextResponse.json({ success: false, error: "Missing 'uuid' parameter" }, { status: 400 });
    }

    const storedWallet = walletStore.getWallet(uuid);
    if (!storedWallet) {
      return NextResponse.json({ success: false, error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      userShare: storedWallet.userShare,
      walletId: storedWallet.walletData.id,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}