import { vi } from 'vitest';

export const mockWeb3Wallet = {
  init: vi.fn().mockResolvedValue(undefined),
  pair: vi.fn().mockResolvedValue(undefined),
  approveSession: vi.fn().mockResolvedValue(undefined),
  rejectSession: vi.fn().mockResolvedValue(undefined),
  updateSession: vi.fn().mockResolvedValue(undefined),
  extendSession: vi.fn().mockResolvedValue(undefined),
  disconnectSession: vi.fn().mockResolvedValue(undefined),
  respondSessionRequest: vi.fn().mockResolvedValue(undefined),
  getActiveSessions: vi.fn().mockReturnValue({}),
  getPendingSessionProposals: vi.fn().mockReturnValue({}),
  getPendingSessionRequests: vi.fn().mockReturnValue({}),
  on: vi.fn(),
  off: vi.fn(),
  removeListener: vi.fn(),
  emit: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    removeListener: vi.fn(),
  },
  core: {
    projectId: 'test-project-id',
  },
};

export const createMockWeb3Wallet = () => mockWeb3Wallet;
