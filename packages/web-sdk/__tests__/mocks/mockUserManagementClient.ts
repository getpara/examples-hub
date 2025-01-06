import { vi } from 'vitest';
import { CAPSULE_SHARE, PREGEN_WALLET, SESSION_PUBLIC_KEYS, WALLET, WALLETS } from '../constants';

export const mockGetCapsuleShare = vi.fn().mockResolvedValue(CAPSULE_SHARE);
export const mockRefreshKeys = vi.fn().mockResolvedValue({ data: { protocolId: WALLET.protocolId } });
export const mockSendTransactionUserManagement = vi.fn().mockResolvedValue({ data: { protocolId: WALLET.protocolId } });
export const mockSignTransaction = vi.fn().mockResolvedValue({ data: { protocolId: WALLET.protocolId } });
export const mockPreSignMessage = vi.fn().mockResolvedValue({ protocolId: WALLET.protocolId });
export const mockCreateWalletPreGen = vi.fn().mockResolvedValue({ walletId: WALLET.id, protocolId: WALLET.protocolId });
export const mockCreateWallet = vi.fn().mockResolvedValue({ walletId: WALLET.id, protocolId: WALLET.protocolId });
export const mockGetWallets = vi.fn().mockResolvedValue({ data: { wallets: WALLETS } });
export const mockGetSessionPublicKeys = vi.fn().mockResolvedValue({ data: { keys: SESSION_PUBLIC_KEYS } });
export const mockGetPregenWallets = vi.fn().mockResolvedValue({ wallets: [PREGEN_WALLET] });
export const mockIsRefreshDone = vi.fn().mockResolvedValue({ isDone: true });

vi.mock('@usecapsule/user-management-client', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    default: vi.fn().mockImplementation(() => ({
      ...(actual as any).default,
      getCapsuleShare: mockGetCapsuleShare,
      refreshKeys: mockRefreshKeys,
      sendTransaction: mockSendTransactionUserManagement,
      signTransaction: mockSignTransaction,
      preSignMessage: mockPreSignMessage,
      createWalletPreGen: mockCreateWalletPreGen,
      createWallet: mockCreateWallet,
      getWallets: mockGetWallets,
      getSessionPublicKeys: mockGetSessionPublicKeys,
      getPregenWallets: mockGetPregenWallets,
      isRefreshDone: mockIsRefreshDone,
    })),
  };
});
