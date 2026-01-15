import { getParaClient } from '@/lib/para/client';
import { encrypt } from '@/lib/db/encryption';
import { storeWallet, getWalletByEmail } from '@/lib/db/keySharesDB';
import type { GenerateWalletRequestBody, GenerateWalletResponse } from '@/lib/para/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateWalletRequestBody = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json<GenerateWalletResponse>({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<GenerateWalletResponse>({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    const para = getParaClient();

    // Check if a pregen wallet already exists for this email in Para
    const hasPregenWallet = await para.hasPregenWallet({
      pregenId: { email },
    });

    if (hasPregenWallet) {
      // Wallet exists in Para - check if we have the userShare in our database
      const existingWallet = await getWalletByEmail(email);

      if (existingWallet) {
        // We have the wallet stored, return success so UI can proceed to claiming
        return NextResponse.json<GenerateWalletResponse>({
          success: true,
          email,
          wallet: {
            address: existingWallet.wallet_address ?? undefined,
          },
        });
      }

      // Wallet exists in Para but we don't have the userShare - cannot proceed
      return NextResponse.json<GenerateWalletResponse>(
        { success: false, error: 'A pre-generated wallet exists for this email but the userShare is not available' },
        { status: 409 }
      );
    }

    // Create pregen wallet with email as the identifier
    // This means the user must authenticate with the same email to claim it
    const wallet = await para.createPregenWallet({
      type: 'EVM',
      pregenId: { email },
    });

    const userShare = para.getUserShare();

    if (!wallet || !userShare) {
      throw new Error('Failed to generate wallet or user share');
    }

    // Encrypt the user share before storing in the database
    const encryptedUserShare = await encrypt(userShare);

    // Store in SQLite database
    await storeWallet(email, encryptedUserShare, wallet.address, wallet.id);

    return NextResponse.json<GenerateWalletResponse>({
      success: true,
      email,
      wallet: {
        address: wallet.address,
      },
    });
  } catch (error) {
    console.error('Error creating pregen wallet:', error);
    return NextResponse.json<GenerateWalletResponse>({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
