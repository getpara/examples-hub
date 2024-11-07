import { StoreApi } from 'zustand';
import { ExternalWalletProviderActions, ExternalWalletProviderStore } from './useExternalWalletProviderStore.js';

export const getActions = (set: StoreApi<ExternalWalletProviderStore>['setState']): ExternalWalletProviderActions => ({
  updateState: state => {
    set(state);
  },
});
