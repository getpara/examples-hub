import { NextRequest, NextResponse } from 'next/server';
import { getWalletByEmail } from '@/lib/db/keySharesDB';
import { decrypt } from '@/lib/db/encryption';
import type { GetWalletShareResponse } from '@/lib/para/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json<GetWalletShareResponse>(
        { success: false, error: "Missing 'email' parameter" },
        { status: 400 }
      );
    }

    const storedWallet = await getWalletByEmail(email);

    if (!storedWallet) {
      // No pregen wallet found for this email - this is not an error,
      // it just means this user doesn't have a pregen wallet to claim
      return NextResponse.json<GetWalletShareResponse>({
        success: true,
        userShare: null,
      });
    }

    // Decrypt the user share before returning
    const userShare = await decrypt(storedWallet.encrypted_user_share);

    return NextResponse.json<GetWalletShareResponse>({
      success: true,
      userShare,
      walletId: storedWallet.wallet_id ?? undefined,
    });
  } catch (error) {
    console.error('[/api/wallet/share] Error:', error);
    return NextResponse.json<GetWalletShareResponse>(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
