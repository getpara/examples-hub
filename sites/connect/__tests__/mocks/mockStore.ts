import { vi } from 'vitest';

export const mockModalStore = {
  state: {
    open: false,
    view: null,
    data: null,
  },
  open: vi.fn(),
  close: vi.fn(),
  setData: vi.fn(),
  setView: vi.fn(),
};

export const mockSettingsStore = {
  state: {
    account: '',
    eip155Address: '',
    cosmosAddress: '',
    solanaAddress: '',
    selectedWallet: null,
    relayerRegion: 'default',
  },
  setAccount: vi.fn(),
  setEIP155Address: vi.fn(),
  setCosmosAddress: vi.fn(),
  setSolanaAddress: vi.fn(),
  setSelectedWallet: vi.fn(),
  setRelayerRegion: vi.fn(),
};

export const mockUserStore = {
  wallets: [],
  selectedWallet: null,
  isLoggedIn: false,
  setWallets: vi.fn(),
  setSelectedWallet: vi.fn(),
  setIsLoggedIn: vi.fn(),
  reset: vi.fn(),
};
