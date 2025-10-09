import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import {
  mockGetTransmissionKeyshares,
  mockGetWallets,
  mockTouchSession,
  resetClientMocks,
} from '../mocks/mockUserManagementClient';
import { resetPlatformMocks } from '../mocks/mockPlatformUtils';
import { Environment } from '../../src';
import * as cryptoUtils from '../../src/cryptography/utils';
import { API_KEY, COMMON_SEARCH_PARAMS, PARTNER, SESSION, SESSION_ID, SOLANA_WALLET, WALLET } from '../constants';
import { expectSearchParams, prepareMockSession } from '../utils';
import { mockWindowLocation } from '../setup.js';

describe('ParaCore - switch wallets', () => {
  let para: MockPara;

  // Shared test data
  const NEW_EVM_WALLET_ID = 'new-evm-wallet-id';
  const NEW_SOLANA_WALLET_ID = 'new-solana-wallet-id';
  const NEW_EVM_SIGNER = 'new-evm-signer-mock-value';
  const NEW_SOLANA_SIGNER = 'new-solana-signer-mock-value';

  // Helper to set up wallet switch IDs
  const setupWalletSwitchIds = (evmId: string, solanaId: string) => {
    (para as any).walletSwitchIds = {
      EVM: [evmId],
      COSMOS: [evmId],
      SOLANA: [solanaId],
    };
  };

  // Helper to create new wallet IDs structure
  const createWalletIdsStructure = (evmId: string, solanaId: string) => ({
    EVM: [evmId],
    COSMOS: [evmId],
    SOLANA: [solanaId],
  });

  beforeAll(async () => {
    // Use a simple mock worker content instead of reading from file to avoid I/O overhead
    const mockWorkerContent = '// Mock prime worker content for tests';
    // Mock fetch to return worker content when needed, but also handle other URLs
    global.fetch = vi.fn(url => {
      if (typeof url === 'string' && url.includes('prime.worker.min.js')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(mockWorkerContent),
        } as Response);
      }
      // For other URLs, return a generic successful response
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('// Mock content'),
        json: () => Promise.resolve({}),
      } as Response);
    });
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    resetClientMocks();
    resetPlatformMocks();

    para = new MockPara(Environment.DEV, API_KEY);
    const { session } = await prepareMockSession({
      excludePregen: true,
      excludeUnclaimed: true,
      excludeUnclaimable: true,
    });
    await para.importSession(session);
  });

  it('getSwitchWalletsUrl works correctly', async () => {
    // Mock getPublicKeyHex to avoid needing a real key pair
    const mockEncryptionKey = 'mock-encryption-key-hex';
    const getPublicKeyHexSpy = vi.spyOn(cryptoUtils, 'getPublicKeyHex').mockReturnValue(mockEncryptionKey);

    // Set a minimal mock key pair
    const mockKeyPair = { privateKey: {}, publicKey: {} } as any;
    await para.setLoginEncryptionKeyPair(mockKeyPair);

    const result = await (para as unknown as any).getSwitchWalletsUrl();
    const url = new URL(result);

    expectSearchParams(url, {
      ...COMMON_SEARCH_PARAMS,
      apiKey: API_KEY,
      origin: mockWindowLocation.origin,
      authInfo: JSON.stringify(para.authInfo),
      currentWalletIds: JSON.stringify(para.currentWalletIds),
      email: para.email!,
      encryptionKey: mockEncryptionKey,
      pregenIds: '{}',
      sessionId: SESSION_ID,
      userId: para.userId!,
    });

    getPublicKeyHexSpy.mockRestore();
  });

  it('waitForWalletSwitching works correctly', async () => {
    // Set up the wallet switch IDs that would be set by the portal
    setupWalletSwitchIds(NEW_EVM_WALLET_ID, NEW_SOLANA_WALLET_ID);

    // Mock touchSession to return the new wallet IDs
    // Note: Use mockResolvedValue (not Once) because touchSession is called multiple times during polling
    mockTouchSession.mockResolvedValue({
      ...SESSION,
      currentWalletIds: createWalletIdsStructure(NEW_EVM_WALLET_ID, NEW_SOLANA_WALLET_ID),
      needsWallet: false,
    });

    // Mock getTransmissionKeyshares to return shares for the new wallets
    mockGetTransmissionKeyshares.mockResolvedValue({
      data: {
        temporaryShares: [
          {
            walletId: NEW_EVM_WALLET_ID,
            encryptedShare: 'encrypted-share-1',
            encryptedKey: 'encrypted-key-1',
          },
          {
            walletId: NEW_SOLANA_WALLET_ID,
            encryptedShare: 'encrypted-share-2',
            encryptedKey: 'encrypted-key-2',
          },
        ],
      },
    });

    // Mock getWallets to return the new wallets
    mockGetWallets.mockResolvedValue({
      data: {
        wallets: [
          { ...WALLET, id: NEW_EVM_WALLET_ID },
          { ...SOLANA_WALLET, id: NEW_SOLANA_WALLET_ID },
        ],
      },
    });

    // Spy on setupAfterLogin to mock the decryption process
    // This avoids needing to set up the loginEncryptionKeyPair
    const setupAfterLoginSpy = vi.spyOn(para as any, 'setupAfterLogin').mockImplementation(async ({ temporaryShares }) => {
      // Manually set up the wallets with mock signers
      temporaryShares.forEach((share: any, index: number) => {
        const signer = index === 0 ? NEW_EVM_SIGNER : NEW_SOLANA_SIGNER;
        (para as any).wallets[share.walletId] = {
          id: share.walletId,
          signer,
        };
      });
    });

    const result = await (para as unknown as any).waitForWalletSwitching();

    expect(result).toEqual({
      needsWallet: false,
      partnerId: PARTNER.id,
    });

    // Verify that setupAfterLogin was called
    expect(setupAfterLoginSpy).toHaveBeenCalled();

    // Verify that walletSwitchIds was cleared after successful switching
    expect((para as any).walletSwitchIds).toBeUndefined();

    // Verify that currentWalletIds were updated
    expect(para.currentWalletIds).toEqual(createWalletIdsStructure(NEW_EVM_WALLET_ID, NEW_SOLANA_WALLET_ID));

    // Verify the wallets were set up with the correct signers
    expect((para as any).wallets[NEW_EVM_WALLET_ID]).toEqual({
      id: NEW_EVM_WALLET_ID,
      signer: NEW_EVM_SIGNER,
    });
    expect((para as any).wallets[NEW_SOLANA_WALLET_ID]).toEqual({
      id: NEW_SOLANA_WALLET_ID,
      signer: NEW_SOLANA_SIGNER,
    });

    // Restore the spy
    setupAfterLoginSpy.mockRestore();
  });

  it('waitForWalletSwitching handles polling and cancellation correctly', async () => {
    // Set up the wallet switch IDs that would be set by the portal
    setupWalletSwitchIds(NEW_EVM_WALLET_ID, NEW_SOLANA_WALLET_ID);

    // Create mock callbacks
    // isCanceled returns false initially, then true after first poll
    let pollCount = 0;
    const isCanceled = vi.fn().mockImplementation(() => {
      return pollCount > 0; // Cancel after first poll cycle
    });
    const onCancel = vi.fn();
    const onPoll = vi.fn().mockImplementation(() => {
      pollCount++;
    });

    // Mock touchSession - return no walletSwitchIds to trigger polling
    mockTouchSession.mockResolvedValue({
      ...SESSION,
      currentWalletIds: createWalletIdsStructure(NEW_EVM_WALLET_ID, NEW_SOLANA_WALLET_ID),
      needsWallet: false,
    });

    // Call waitForWalletSwitching with cancellation
    await expect((para as unknown as any).waitForWalletSwitching({ isCanceled, onCancel, onPoll })).rejects.toBe('canceled');

    // Verify that onPoll was called at least once
    expect(onPoll).toHaveBeenCalled();
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Verify that isCanceled was called (at least twice - once before first poll, once after)
    expect(isCanceled).toHaveBeenCalled();
    expect(isCanceled.mock.calls.length).toBeGreaterThanOrEqual(2);

    // Verify that onCancel was called
    expect(onCancel).toHaveBeenCalledOnce();

    // Verify that walletSwitchIds was cleared after cancellation
    expect((para as any).walletSwitchIds).toBeUndefined();
  });
});
