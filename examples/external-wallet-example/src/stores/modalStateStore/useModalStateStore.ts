import { TOAuthMethod, ExternalWallet, AuthLayout } from '@getpara/react-sdk';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ModalStateState {
  oAuthMethods: TOAuthMethod[];
  externalWallets: (keyof typeof ExternalWallet)[];
  authLayout: AuthLayout[];
  logo?: string;
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;
  mode: 'dark' | 'light';
}

export interface ModalStateActions {
  updateState: (state: Partial<ModalStateState>) => void;
}

export type ModalStateStore = ModalStateState & ModalStateActions;

const DEFAULT_STATE: ModalStateState = {
  oAuthMethods: ['GOOGLE', 'FACEBOOK', 'APPLE', 'TWITTER', 'DISCORD', 'FARCASTER'],
  externalWallets: [ExternalWallet.RAINBOW, ExternalWallet.METAMASK, ExternalWallet.WALLETCONNECT],
  authLayout: [AuthLayout.EXTERNAL_FULL, AuthLayout.AUTH_CONDENSED],
  logo: undefined,
  backgroundColor: '#141414',
  foregroundColor: 'white',
  accentColor: 'red',
  mode: 'dark',
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
      }),
    },
  ),
);
