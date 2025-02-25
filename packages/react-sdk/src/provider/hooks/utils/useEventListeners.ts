import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useClient, useWalletState } from '../index.js';
import {
  AccountCreationEvent,
  AccountSetupEvent,
  ExternalWalletChangeEvent,
  LoginEvent,
  LogoutEvent,
  ParaEvent,
  PregenWalletClaimedEvent,
  SignMessageEvent,
  SignTransactionEvent,
  WalletCreatedEvent,
  WalletsChangeEvent,
} from '@getpara/web-sdk';
import { ACCOUNT_BASE_KEY } from '../queries/useAccount.js';
import { useStore } from '../../stores/useStore.js';
import { WALLET_BASE_KEY } from '../queries/useWallet.js';
import { Callbacks } from '../../types/provider.js';

export const useEventListeners = ({
  onLogin,
  onLogout,
  onAccountSetup,
  onAccountCreation,
  onSignMessage,
  onSignTransaction,
  onWalletCreated,
  onPregenWalletClaimed,
  onExternalWalletChange,
  onWalletsChange,
}: Callbacks = {}) => {
  const queryClient = useQueryClient();
  const client = useClient();
  const clearSelectedWallet = useStore(state => state.clearSelectedWallet);
  const { selectedWallet, setSelectedWallet } = useWalletState();

  const loginListener = (event: LoginEvent) => {
    loginOrSetupListener();
    onLogin?.(event);
  };

  const accountSetupListener = (event: AccountSetupEvent) => {
    loginOrSetupListener();
    onAccountSetup?.(event);
  };

  const loginOrSetupListener = () => {
    queryClient.invalidateQueries({ queryKey: [ACCOUNT_BASE_KEY], exact: false });
    queryClient.invalidateQueries({ queryKey: [WALLET_BASE_KEY], exact: false });
  };

  const accountCreationListener = (event: AccountCreationEvent) => {
    onAccountCreation?.(event);
  };

  const logoutListener = (event: LogoutEvent) => {
    queryClient.invalidateQueries({ queryKey: [ACCOUNT_BASE_KEY], exact: false });
    clearSelectedWallet();
    onLogout?.(event);
  };

  const signMessageListener = (event: SignMessageEvent) => {
    onSignMessage?.(event);
  };

  const signTransactionListener = (event: SignTransactionEvent) => {
    onSignTransaction?.(event);
  };

  const walletChangeListener = (event: WalletsChangeEvent) => {
    updateSelectedWallet();
    onWalletsChange?.(event);
  };

  const externalWalletChangeListener = (event: ExternalWalletChangeEvent) => {
    updateSelectedWallet();
    onExternalWalletChange?.(event);
  };

  const walletCreatedListener = (event: WalletCreatedEvent) => {
    onWalletCreated?.(event);
  };

  const pregenWalletClaimedListener = (event: PregenWalletClaimedEvent) => {
    onPregenWalletClaimed?.(event);
  };

  const updateSelectedWallet = () => {
    if (!client) {
      clearSelectedWallet();
      return;
    }

    if (!selectedWallet?.id || !client.findWallet(selectedWallet?.id)) {
      const defaultWallet = client.findWallet(undefined, undefined, { forbidPregen: true });

      setSelectedWallet({ id: defaultWallet?.id, type: defaultWallet?.type });
    }
  };

  useEffect(() => {
    window.addEventListener(ParaEvent.LOGIN_EVENT, loginListener);
    window.addEventListener(ParaEvent.ACCOUNT_SETUP_EVENT, accountSetupListener);
    window.addEventListener(ParaEvent.ACCOUNT_CREATION_EVENT, accountCreationListener);
    window.addEventListener(ParaEvent.LOGOUT_EVENT, logoutListener);
    window.addEventListener(ParaEvent.SIGN_MESSAGE_EVENT, signMessageListener);
    window.addEventListener(ParaEvent.SIGN_TRANSACTION_EVENT, signTransactionListener);
    window.addEventListener(ParaEvent.WALLETS_CHANGE_EVENT, walletChangeListener);
    window.addEventListener(ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT, externalWalletChangeListener);
    window.addEventListener(ParaEvent.WALLET_CREATED, walletCreatedListener);
    window.addEventListener(ParaEvent.PREGEN_WALLET_CLAIMED, pregenWalletClaimedListener);

    return () => {
      window.removeEventListener(ParaEvent.LOGIN_EVENT, loginListener);
      window.removeEventListener(ParaEvent.ACCOUNT_SETUP_EVENT, accountSetupListener);
      window.removeEventListener(ParaEvent.ACCOUNT_CREATION_EVENT, accountCreationListener);
      window.removeEventListener(ParaEvent.LOGOUT_EVENT, logoutListener);
      window.removeEventListener(ParaEvent.SIGN_MESSAGE_EVENT, signMessageListener);
      window.removeEventListener(ParaEvent.SIGN_TRANSACTION_EVENT, signTransactionListener);
      window.removeEventListener(ParaEvent.WALLETS_CHANGE_EVENT, walletChangeListener);
      window.removeEventListener(ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT, externalWalletChangeListener);
      window.removeEventListener(ParaEvent.WALLET_CREATED, walletCreatedListener);
      window.removeEventListener(ParaEvent.PREGEN_WALLET_CLAIMED, pregenWalletClaimedListener);
    };
  }, [client]);
};
