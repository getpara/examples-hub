import { vi } from 'vitest';

const mockTransaction = {
  instructions: [],
  version: 0,
  messageBytes: new Uint8Array([1, 2, 3, 4, 5]),
};

export const mockRpc = {
  sendTransaction: vi.fn().mockReturnValue({
    send: vi.fn().mockResolvedValue('mockTransactionSignature'),
  }),
};

export const createMockTransaction = (serialize = true) => {
  const tx = {
    ...mockTransaction,
    messageBytes: new Uint8Array([1, 2, 3, 4, 5]),
    serialize: serialize ? vi.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4, 5])) : undefined,
  };
  return tx;
};
