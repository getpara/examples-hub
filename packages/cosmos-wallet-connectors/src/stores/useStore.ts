import { create } from 'zustand';
import { syncTabs } from 'zustand-sync-tabs';

interface ExternalWalletState {
  isConnecting: boolean;
}

export interface ExternalWalletActions {
  updateState: (_: ExternalWalletState) => void;
}

export type ExternalWalletStore = ExternalWalletState & ExternalWalletActions;

export const useExternalWalletStore = create<ExternalWalletStore>(
  syncTabs(
    set => ({
      isConnecting: false,
      updateState: state => {
        set({ ...state });
      },
    }),
    {
      name: 'para-cosmos-external-wallet-state',
    },
  ),
);
