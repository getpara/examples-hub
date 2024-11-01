import { vi } from 'vitest';
import { SOLANA_WALLET_KEYGEN_RES, WALLET_KEYGEN_RES } from '../constants';

vi.mock('../../src/cryptography/utils', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    decryptWithPrivateKey: vi
      .fn()
      .mockResolvedValue(WALLET_KEYGEN_RES.signer)
      .mockResolvedValue(SOLANA_WALLET_KEYGEN_RES.signer),
  };
});
