import { vi } from 'vitest';
import { SIGNATURE, WALLET } from '../constants';

export const mockMPCPost = vi.fn(async endpoint => {
  switch (endpoint) {
    case '/wallets': {
      return { data: { signer: WALLET.signer } };
    }
    case `/wallets/${WALLET.id}/messages/sign`: {
      return { data: { signature: SIGNATURE } };
    }
    case `/wallets/${WALLET.id}/transactions/send`: {
      return { data: { signature: SIGNATURE } };
    }
  }
});

export const mockMPCClient = {
  post: mockMPCPost,
} as any;
