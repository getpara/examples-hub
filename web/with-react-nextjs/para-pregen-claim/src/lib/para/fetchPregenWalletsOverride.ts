import type { PregenAuth } from '@getpara/server-sdk';
import type { GetWalletShareResponse } from './types';

export async function fetchPregenWalletsOverride(opts: { pregenId: PregenAuth }) {
  const { pregenId } = opts;
  const email = 'email' in pregenId ? pregenId.email : null;

  if (!email) {
    return { userShare: undefined };
  }

  try {
    const response = await fetch('/api/wallet/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data: GetWalletShareResponse = await response.json();

    if (data.success && data.userShare) {
      return { userShare: data.userShare };
    }
  } catch {
    return { userShare: undefined };
  }

  return { userShare: undefined };
}
