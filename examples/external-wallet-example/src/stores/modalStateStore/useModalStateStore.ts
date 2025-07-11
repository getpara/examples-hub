import {
  TOAuthMethod,
  TExternalWallet,
  AuthLayout,
  useLinkAccount,
  OAUTH_METHODS,
  EXTERNAL_WALLET_TYPES,
} from '@getpara/react-sdk';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ModalStateState {
  oAuthMethods: TOAuthMethod[];
  externalWallets: TExternalWallet[];
  authLayout: AuthLayout[];
  logo?: string;
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;
  mode: 'dark' | 'light';
  externalWalletConnectionOnly: boolean;
  externalWalletIncludeVerification: boolean;
  linkAccountArgs: Parameters<ReturnType<typeof useLinkAccount>['linkAccount']>[0];
  farcasterDisableAutoConnect: boolean;
}

export interface ModalStateActions {
  updateState: (state: Partial<ModalStateState>) => void;
}

export type ModalStateStore = ModalStateState & ModalStateActions;

const DEFAULT_STATE: ModalStateState = {
  oAuthMethods: [...OAUTH_METHODS],
  externalWallets: [...EXTERNAL_WALLET_TYPES],
  authLayout: [AuthLayout.EXTERNAL_FULL, AuthLayout.AUTH_CONDENSED],
  logo: undefined,
  backgroundColor: '#141414',
  foregroundColor: 'white',
  accentColor: 'red',
  mode: 'dark',
  externalWalletConnectionOnly: false,
  externalWalletIncludeVerification: false,
  linkAccountArgs: undefined,
  farcasterDisableAutoConnect: false,
};

export const useModalStateStore = create<ModalStateStore>()(
  persist(
    set => ({
      ...DEFAULT_STATE,
      updateState: state => set(state),
    }),
    {
      version: 2,
      name: '@PARA_EXAMPLE_APP/modalState',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        oAuthMethods: state.oAuthMethods,
        externalWallets: state.externalWallets,
        authLayout: state.authLayout,
        logo: state.logo,
        backgroundColor: state.backgroundColor,
        foregroundColor: state.foregroundColor,
        accentColor: state.accentColor,
        mode: state.mode,
        externalWalletConnectionOnly: state.externalWalletConnectionOnly,
        externalWalletIncludeVerification: state.externalWalletIncludeVerification,
        farcasterDisableAutoConnect: state.farcasterDisableAutoConnect,
      }),
    },
  ),
);
