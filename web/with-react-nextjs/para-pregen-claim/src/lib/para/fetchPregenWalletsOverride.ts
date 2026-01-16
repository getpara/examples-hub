import type { PregenAuth } from '@getpara/server-sdk';
import type { GetWalletShareResponse } from './types';

/**
 * This function is called by the ParaProvider when a user authenticates.
 * It receives the pregenId (email, phone, or customId) that the user is authenticating with.
 *
 * If a userShare is returned, Para will automatically claim that pregen wallet
 * for the authenticated user. If no userShare is returned, no wallet is claimed.
 *
 * This is the ideal place to:
 * 1. Check if this user has a pre-generated wallet in your system
 * 2. Fetch the userShare from your secure storage
 * 3. Apply any business logic to determine if the user should claim the wallet
 */
export async function fetchPregenWalletsOverride(opts: { pregenId: PregenAuth }) {
  const { pregenId } = opts;

  // Extract the email from the pregenId
  // The pregenId contains the identifier the user is authenticating with
  const email = 'email' in pregenId ? pregenId.email : null;

  if (!email) {
    // User is not authenticating with email, so no pregen wallet to claim
    return { userShare: undefined };
  }

  try {
    // Fetch the userShare from our server for this email
    const response = await fetch(`/api/wallet/share?email=${encodeURIComponent(email)}`);
    const data: GetWalletShareResponse = await response.json();

    if (data.success && data.userShare) {
      // Return the userShare - Para will automatically claim this wallet
      // when the user completes authentication with this email
      return { userShare: data.userShare };
    }
  } catch (error) {
    console.error('[fetchPregenWalletsOverride] Failed to fetch pregen wallet:', error);
  }

  // No pregen wallet found for this email
  return { userShare: undefined };
}
