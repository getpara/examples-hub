import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useWalletState } from '../index.js';
import {
  AccountCreationEvent,
  AccountSetupEvent,
  ExternalWalletChangeEvent,
  GuestWalletsCreatedEvent,
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
  onGuestWalletsCreated,
}: Callbacks = {}) => {
  const queryClient = useQueryClient();
  const clearSelectedWallet = useStore(state => state.clearSelectedWallet);
  const { updateSelectedWallet } = useWalletState();

  const loginOrSetupListener = useCallback(() => {
    queryClient.refetchQueries({ queryKey: [ACCOUNT_BASE_KEY] });
    queryClient.refetchQueries({ queryKey: [WALLET_BASE_KEY] });
  }, [queryClient]);

  const loginListener = useCallback(
    (event: LoginEvent) => {
      loginOrSetupListener();
      onLogin?.(event);
    },
    [loginOrSetupListener, onLogin],
  );

  const accountSetupListener = useCallback(
    (event: AccountSetupEvent) => {
      loginOrSetupListener();
      onAccountSetup?.(event);
    },
    [loginOrSetupListener, onAccountSetup],
  );

  const accountCreationListener = useCallback(
    (event: AccountCreationEvent) => {
      onAccountCreation?.(event);
    },
    [onAccountCreation],
  );

  const logoutListener = useCallback(
    (event: LogoutEvent) => {
      queryClient.refetchQueries({ queryKey: [ACCOUNT_BASE_KEY] });
      clearSelectedWallet();
      onLogout?.(event);
    },
    [queryClient, clearSelectedWallet, onLogout],
  );

  const signMessageListener = useCallback(
    (event: SignMessageEvent) => {
      onSignMessage?.(event);
    },
    [onSignMessage],
  );

  const signTransactionListener = useCallback(
    (event: SignTransactionEvent) => {
      onSignTransaction?.(event);
    },
    [onSignTransaction],
  );

  const walletChangeListener = useCallback(
    (event: WalletsChangeEvent) => {
      queryClient.refetchQueries({ queryKey: [ACCOUNT_BASE_KEY] });
      updateSelectedWallet();
      onWalletsChange?.(event);
    },
    [queryClient, updateSelectedWallet, onWalletsChange],
  );

  const externalWalletChangeListener = useCallback(
    (event: ExternalWalletChangeEvent) => {
      queryClient.refetchQueries({ queryKey: [ACCOUNT_BASE_KEY] });
      updateSelectedWallet();
      onExternalWalletChange?.(event);
    },
    [queryClient, updateSelectedWallet, onExternalWalletChange],
  );

  const walletCreatedListener = useCallback(
    (event: WalletCreatedEvent) => {
      onWalletCreated?.(event);
    },
    [onWalletCreated],
  );

  const pregenWalletClaimedListener = useCallback(
    (event: PregenWalletClaimedEvent) => {
      onPregenWalletClaimed?.(event);
    },
    [onPregenWalletClaimed],
  );

  const guestWalletsCreatedListener = useCallback(
    (event: GuestWalletsCreatedEvent) => {
      onGuestWalletsCreated?.(event);
    },
    [onGuestWalletsCreated],
  );

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
    window.addEventListener(ParaEvent.GUEST_WALLETS_CREATED, guestWalletsCreatedListener);

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
      window.removeEventListener(ParaEvent.GUEST_WALLETS_CREATED, guestWalletsCreatedListener);
    };
  }, [
    loginListener,
    accountSetupListener,
    accountCreationListener,
    logoutListener,
    signMessageListener,
    signTransactionListener,
    walletChangeListener,
    externalWalletChangeListener,
    walletCreatedListener,
    pregenWalletClaimedListener,
    guestWalletsCreatedListener,
  ]);
};
