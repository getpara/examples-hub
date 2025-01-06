import { vi } from 'vitest';
import { RECOVERY_SHARE } from '../constants.js';

export const mockDistributeNewShare = vi.fn(() => RECOVERY_SHARE);

vi.mock('@usecapsule/core-sdk', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    distributeNewShare: mockDistributeNewShare,
  };
});
