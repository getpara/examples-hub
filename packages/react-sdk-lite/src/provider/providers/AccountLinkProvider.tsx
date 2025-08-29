import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useAccountLinkInProgress, useModal } from '../index.js';
import * as actions from '../actions/index.js';
import { MutationStatus, useQueryClient } from '@tanstack/react-query';
import {
  AccountLinkError,
  AccountLinkInProgress as CoreAccountLinkInProgress,
  LinkedAccount,
  LinkedAccounts,
  LINKED_ACCOUNT_TYPES,
  SupportedAccountLinks,
  TelegramAuthResponse,
  TLinkedAccountType,
  Auth,
  AuthInfo,
  InternalMethodParams,
} from '@getpara/web-sdk';
import { useModalStore } from '../../modal/stores/index.js';
import { ModalStep } from '../../modal/index.js';
import { useGoBack } from '../../modal/hooks/useGoBack.js';
import { useExternalWallets } from './ExternalWalletProvider.js';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { generateInternalMutation } from '../hooks/mutations/utils.js';
import { validateAuth } from '../../modal/utils/authInputHelpers.js';
import { EXTERNAL_WALLET_TYPES, extractAuthInfo, TExternalWallet, TWalletType } from '@getpara/user-management-client';
import { useStore } from '../stores/useStore.js';
import { LINKED_ACCOUNTS_BASE_KEY } from '../hooks/queries/useLinkedAccounts.js';

type AccountLinkInProgress = Partial<
  CoreAccountLinkInProgress & { pendingWalletProvider?: string; pendingWalletType?: TWalletType }
>;

export type ModalLinkAccountArgs =
  | undefined
  | { auth: Auth<'email' | 'phone'> }
  | {
      type: Exclude<TLinkedAccountType, 'EXTERNAL_WALLET'> | 'X';
    }
  | {
      // For internal modal usage we'll pass the external wallet id as a string regardless of whether it's a supported wallet type or not
      // For the hook we want devs to pass in one of our supported external wallet types for better type safety and dev ex
      externalWallet: { provider: TExternalWallet | string; type?: TWalletType };
    }
  | {
      options: SupportedAccountLinks;
    };

type Value = {
  isEnabled: boolean;
  accountLinkInProgress: AccountLinkInProgress | undefined;
  accountLinkOptions: SupportedAccountLinks;
  linkAccount: (_: ModalLinkAccountArgs) => Promise<void>;
  isLinkAccountPending: boolean;
  verifyEmailOrPhoneLink: (verificationCode: string) => void;
  verifyOAuthLink: (method: InternalMethodParams<'verifyOAuthLink'>['method']) => void;
  verifyFarcasterLink: () => void;
  verifyTelegramLink: (telegramAuthResponse: TelegramAuthResponse) => void;
  verifyLinkedAccount: (accountLinkInProgress: AccountLinkInProgress) => void;
  linkAccountStatus: MutationStatus;
  linkAccountError: string | null;
  setLinkAccountError: (_: AccountLinkError | null) => void;
  unlinkingAccount: LinkedAccount | undefined;
  unlinkAccount: (linkedAccount: LinkedAccount) => void;
  unlinkAccountConfirm: () => void;
  isUnlinkAccountPending: boolean;
  cancelLinkAccount: () => void;
  onAccountLinked: (_: AccountLinkInProgress) => void;
  onAccountLinkVerified: (_: LinkedAccounts) => void;
  resetMutations: () => void;
  // externalWalletQrUri: string | undefined;
};

export const AccountLinkContext = createContext<Value>({
  isEnabled: false,
  accountLinkInProgress: undefined,
  accountLinkOptions: [...LINKED_ACCOUNT_TYPES],
  linkAccount: () => Promise.resolve(),
  isLinkAccountPending: false,
  verifyEmailOrPhoneLink: () => {},
  verifyOAuthLink: () => {},
  verifyFarcasterLink: () => {},
  verifyTelegramLink: () => {},
  verifyLinkedAccount: () => {},
  unlinkingAccount: undefined,
  linkAccountStatus: 'idle',
  linkAccountError: null,
  setLinkAccountError: () => {},
  unlinkAccount: () => {},
  unlinkAccountConfirm: () => {},
  isUnlinkAccountPending: false,
  cancelLinkAccount: () => {},
  onAccountLinked: () => {},
  onAccountLinkVerified: () => {},
  resetMutations: () => {},
  // externalWalletQrUri: undefined,
});

const useLinkAccount = generateInternalMutation('linkAccount', actions.linkAccount);
const useUnlinkAccount = generateInternalMutation('unlinkAccount', actions.unlinkAccount);
const useVerifyOAuthLink = generateInternalMutation('verifyOAuthLink', actions.verifyOAuthLink, { delay: 500 });
const useVerifyEmailOrPhoneLink = generateInternalMutation('verifyEmailOrPhoneLink', actions.verifyEmailOrPhoneLink);
const useVerifyFarcasterLink = generateInternalMutation('verifyFarcasterLink', actions.verifyFarcasterLink, {
  delay: 500,
});
const useVerifyTelegramLink = generateInternalMutation('verifyTelegramLink', actions.verifyTelegramLink);
const useVerifyExternalWalletLink = generateInternalMutation('verifyExternalWalletLink', actions.verifyExternalWalletLink);

export const AccountLinkProvider = ({ children }: PropsWithChildren) => {
  const para = useInternalClient();
  const queryClient = useQueryClient();
  const account = useAccount();
  const { data: coreAccountLinkInProgress } = useAccountLinkInProgress();
  const {
    wallet: connectedWallet,
    wallets,
    signMessage,
    isSigningMessage,
    requestInfo: externalWalletRequestInfo,
    disconnectBase,
  } = useExternalWallets();
  const { isOpen, openModal } = useModal();
  const includeWalletVerification = useStore(state => state.includeWalletVerification);
  const setStep = useModalStore(state => state.setStep);
  const setFarcasterConnectUri = useModalStore(state => state.setFarcasterConnectUri);
  const refs = useModalStore(state => state.refs);
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const accountLinkOptions = useModalStore(state => state.accountLinkOptions) || [...LINKED_ACCOUNT_TYPES];
  const setAccountLinkOptions = useModalStore(state => state.setAccountLinkOptions);
  const externalWalletsWithFullAuth = useStore(state => state.externalWalletsWithFullAuth);
  const goBack = useGoBack();

  const { mutateAsync: mutateLinkAccountAsync, isPending: isLinkAccountPending } = useLinkAccount();
  const { mutate: mutateUnlinkAccount, isPending: isUnlinkAccountPending } = useUnlinkAccount();
  const {
    mutate: mutateVerifyEmailOrPhoneLink,
    status: statusVerifyEmailOrPhoneLink,
    reset: resetVerifyEmailOrPhoneLink,
  } = useVerifyEmailOrPhoneLink();
  const { mutate: mutateVerifyOAuthLink, status: statusVerifyOAuthLink, reset: resetVerifyOAuthLink } = useVerifyOAuthLink();
  const {
    mutate: mutateVerifyFarcasterLink,
    status: statusVerifyFarcasterLink,
    reset: resetVerifyFarcasterLink,
  } = useVerifyFarcasterLink();
  const {
    mutateAsync: mutateVerifyTelegramLinkAsync,
    status: statusVerifyTelegramLink,
    reset: resetVerifyTelegramLink,
  } = useVerifyTelegramLink();
  const {
    mutateAsync: mutateAsyncVerifyExternalWalletLink,
    status: statusVerifyExternalWalletLink,
    reset: resetVerifyExternalWalletLink,
  } = useVerifyExternalWalletLink();

  const { embedded } = account;

  const isEnabled =
    embedded?.isConnected ||
    (!embedded?.isGuestMode &&
      (!para.authInfo?.externalWallet ||
        includeWalletVerification ||
        externalWalletsWithFullAuth === 'ALL' ||
        externalWalletsWithFullAuth.includes(para.authInfo?.externalWallet?.providerId as TExternalWallet)));

  const [accountLinkInProgress, setAccountLinkInProgress] = useState<AccountLinkInProgress | undefined>(
    coreAccountLinkInProgress || undefined,
  );
  const [unlinkingAccount, setUnlinkingAccount] = useState<LinkedAccount | undefined>(undefined);
  const [linkAccountError, setLinkAccountError] = useState<string | null>(null);
  const [linkAccountStatus, setLinkAccountStatus] = useState<MutationStatus>('pending');

  const linkAccount = async (args?: ModalLinkAccountArgs) => {
    if (!isEnabled) {
      setLinkAccountError(AccountLinkError.NotAuthenticated);

      throw new Error(AccountLinkError.NotAuthenticated);
    }

    setLinkAccountError(null);

    switch (true) {
      case !args:
      case args && 'options' in args:
        {
          const options = args?.options || para?.supportedAccountLinks || [...LINKED_ACCOUNT_TYPES];

          if (options.length < 2) {
            throw new Error('Account linking options array must contain 2 or more items');
          }

          setAccountLinkOptions(options);

          openModal({ step: ModalStep.ACCOUNT_PROFILE_LIST });
        }
        break;
      case args && 'externalWallet' in args:
        {
          const isSupportedWalletType = EXTERNAL_WALLET_TYPES.includes(args.externalWallet.provider as TExternalWallet);

          let supportedWalletId: string | undefined;

          if (isSupportedWalletType) {
            supportedWalletId = wallets.find(w => w.internalId === args.externalWallet.provider)?.id;

            if (!supportedWalletId) {
              throw new Error(`wallet not installed: ${args.externalWallet.provider}`);
            }
          }

          // If the passed in wallet is officially supported, we use its id, else assume it's an automatically detected wallet
          const providerId = supportedWalletId ?? args.externalWallet.provider;
          const type = args.externalWallet.type;

          if (providerId === connectedWallet?.id) {
            throw new Error(`Cannot link the currently connected external wallet: ${providerId}`);
          }

          setAccountLinkInProgress({
            type: 'EXTERNAL_WALLET',
            pendingWalletProvider: providerId,
            pendingWalletType: type,
          });

          const linkWallet = wallets.find(w => w.id === providerId);

          if (!linkWallet) {
            throw new Error(`wallet not installed: ${providerId}`);
          }

          openModal({ step: !type ? ModalStep.EX_WALLET_NETWORK_SELECT : ModalStep.ACCOUNT_PROFILE_ADD });

          if (!type) {
            return;
          }

          try {
            const externalWallet = await externalWalletRequestInfo(providerId, type);

            const accountLinkInProgress = await mutateLinkAccountAsync({ externalWallet });

            await onAccountLinked(accountLinkInProgress);

            const signatureVerificationMessage = accountLinkInProgress.externalWallet!.signatureVerificationMessage;

            await new Promise(resolve => setTimeout(resolve, 100));

            const {
              signature: signedMessage,
              cosmosPublicKeyHex,
              cosmosSigner,
            } = await signMessage({
              message: signatureVerificationMessage,
              externalWallet: accountLinkInProgress.externalWallet!,
            });

            const updatedAccounts = await mutateAsyncVerifyExternalWalletLink({
              signedMessage: signedMessage!,
              cosmosPublicKeyHex,
              cosmosSigner,
            });

            await onAccountLinkVerified(updatedAccounts);
          } catch (e) {
            console.error(e);

            setLinkAccountError(e.message);
          } finally {
            if (linkWallet.type === 'EVM' || linkWallet.type === 'SOLANA') {
              await disconnectBase(providerId, linkWallet.type);
            }
          }
        }
        break;
      default: {
        switch (true) {
          case 'auth' in args:
            {
              validateAuth(args.auth);

              const authInfo = extractAuthInfo(args.auth, { isRequired: true }) as AuthInfo<'email' | 'phone'>;

              setAccountLinkInProgress({
                type: authInfo.authType.toUpperCase() as 'EMAIL' | 'PHONE',
                identifier: authInfo.identifier,
              });
            }
            break;
          case 'type' in args: {
            if (args.type === 'EMAIL' || args.type === 'PHONE' || !isOpen) {
              setAccountLinkInProgress({ type: args.type === 'X' ? 'TWITTER' : args.type });
            }
            break;
          }
        }

        if (!isOpen) {
          openModal({ step: ModalStep.ACCOUNT_PROFILE_ADD });
        }

        try {
          const accountLinkInProgress = await mutateLinkAccountAsync(args);

          await onAccountLinked(accountLinkInProgress);
        } catch (e) {
          setLinkAccountError(e.message);
        }
      }
    }
  };

  const onAccountLinked = async (accountLinkInProgress: CoreAccountLinkInProgress) => {
    queryClient.setQueryData(['accountLinkInProgress'], accountLinkInProgress ?? null);

    setStep(ModalStep.ACCOUNT_PROFILE_ADD);

    switch (accountLinkInProgress.type) {
      case 'EMAIL':
      case 'PHONE':
      case 'TELEGRAM':
      case 'EXTERNAL_WALLET':
        break;
      case 'FARCASTER':
        verifyFarcasterLink();
        break;
      default:
        verifyLinkedAccount(accountLinkInProgress);
    }
  };

  const verifyEmailOrPhoneLink = async (verificationCode: string) => {
    mutateVerifyEmailOrPhoneLink(
      { verificationCode },
      {
        onSuccess: onAccountLinkVerified,
        onError: onAccountLinkError,
      },
    );
  };

  const verifyOAuthLink = async (method: InternalMethodParams<'verifyOAuthLink'>['method']) => {
    mutateVerifyOAuthLink(
      {
        method,
        isCanceled: () => !!refs.popupWindow.current?.closed,
        onOAuthPopup: oAuthPopup => {
          refs.popupWindow.current = oAuthPopup;
        },
      },
      {
        onSuccess: onAccountLinkVerified,
        onError: onAccountLinkError,
      },
    );
  };

  const verifyFarcasterLink = async () => {
    mutateVerifyFarcasterLink(
      {
        isCanceled: () => refs.currentStep.current !== ModalStep.ACCOUNT_PROFILE_ADD,
        onConnectUri: connectUri => {
          setFarcasterConnectUri(connectUri);
        },
      },
      {
        onSuccess: onAccountLinkVerified,
        onError: () => {
          if (refs.currentStep.current === ModalStep.ACCOUNT_PROFILE_ADD) {
            goBack();
          }
        },
      },
    );
  };

  const verifyTelegramLink = async (telegramAuthResponse: TelegramAuthResponse) => {
    try {
      const accounts = await mutateVerifyTelegramLinkAsync({
        telegramAuthResponse,
      });

      onAccountLinkVerified(accounts);
    } catch (e) {
      onAccountLinkError(e);

      throw e;
    }
  };

  const verifyLinkedAccount = ({ type }: CoreAccountLinkInProgress) => {
    switch (type) {
      case 'EMAIL':
      case 'PHONE':
      case 'TELEGRAM':
      case 'EXTERNAL_WALLET':
        break;
      case 'FARCASTER':
        verifyFarcasterLink();
        break;
      default:
        verifyOAuthLink(type);
        break;
    }
  };

  const onAccountLinkVerified = (updatedAccounts: LinkedAccounts) => {
    queryClient.invalidateQueries({ queryKey: [LINKED_ACCOUNTS_BASE_KEY] });
    queryClient.setQueryData<LinkedAccounts>(['getLinkedAccounts'], () => updatedAccounts);

    setTimeout(() => {
      setStep(ModalStep.ACCOUNT_PROFILE);
    }, 2000);
  };

  const onAccountLinkError = (e: Error | string) => {
    setLinkAccountError(e instanceof Error ? e.message : e);
  };

  const unlinkAccount = (linkedAccount?: LinkedAccount) => {
    setUnlinkingAccount(linkedAccount);

    setStep(ModalStep.ACCOUNT_PROFILE_REMOVE);
  };

  const unlinkAccountConfirm = () => {
    mutateUnlinkAccount(
      {
        linkedAccountId: unlinkingAccount!.id!,
      },
      {
        onSuccess: updatedAccounts => {
          queryClient.setQueryData<LinkedAccounts>(['getLinkedAccounts'], () => updatedAccounts);

          setUnlinkingAccount(undefined);
          setStep(ModalStep.ACCOUNT_PROFILE);
        },
      },
    );
  };

  const cancelLinkAccount = () => {
    mutateUnlinkAccount(undefined);
  };

  const resetMutations = () => {
    resetVerifyEmailOrPhoneLink();
    resetVerifyFarcasterLink();
    resetVerifyOAuthLink();
    resetVerifyTelegramLink();
    resetVerifyExternalWalletLink();
  };

  useEffect(() => {
    setAccountLinkInProgress(prev => {
      return coreAccountLinkInProgress || prev;
    });
  }, [coreAccountLinkInProgress]);

  useEffect(() => {
    if (!isOpen) {
      setLinkAccountError(null);
      setAccountLinkInProgress(undefined);
      setUnlinkingAccount(undefined);
      resetMutations();
    }
  }, [isOpen]);

  useEffect(() => {
    setLinkAccountStatus(() => {
      if (!isEnabled || !accountLinkInProgress) {
        return 'idle';
      }

      if (
        (accountLinkInProgress.type === 'EMAIL' || accountLinkInProgress.type === 'PHONE') &&
        !accountLinkInProgress.identifier
      ) {
        return 'idle';
      }

      if (linkAccountError) return 'error';

      switch (true) {
        case accountLinkInProgress.type === 'TELEGRAM':
          return statusVerifyTelegramLink;
        case accountLinkInProgress.type === 'FARCASTER':
          return statusVerifyFarcasterLink;
        case accountLinkInProgress.type === 'EMAIL':
        case accountLinkInProgress.type === 'PHONE':
          return statusVerifyEmailOrPhoneLink;
        case accountLinkInProgress.type === 'EXTERNAL_WALLET':
          if (isSigningMessage) return 'pending';

          return externalWalletError && externalWalletError.length > 0
            ? 'error'
            : statusVerifyExternalWalletLink === 'idle'
              ? 'pending'
              : statusVerifyExternalWalletLink;
        default:
          return statusVerifyOAuthLink;
      }
    });
  }, [
    linkAccountError,
    isEnabled,
    accountLinkInProgress,
    statusVerifyEmailOrPhoneLink,
    statusVerifyFarcasterLink,
    statusVerifyOAuthLink,
    statusVerifyTelegramLink,
    statusVerifyExternalWalletLink,
    externalWalletError,
    isSigningMessage,
  ]);

  const value = useMemo<Value>(
    () => ({
      isEnabled,
      accountLinkInProgress,
      accountLinkOptions,
      linkAccount,
      isLinkAccountPending,
      verifyOAuthLink,
      verifyFarcasterLink,
      verifyTelegramLink,
      verifyEmailOrPhoneLink,
      verifyLinkedAccount,
      linkAccountStatus,
      linkAccountError,
      setLinkAccountError,
      unlinkingAccount,
      unlinkAccount,
      unlinkAccountConfirm,
      isUnlinkAccountPending,
      cancelLinkAccount,
      onAccountLinked,
      onAccountLinkVerified,
      resetMutations,
    }),
    [
      isEnabled,
      accountLinkInProgress,
      accountLinkOptions,
      linkAccount,
      isLinkAccountPending,
      verifyOAuthLink,
      verifyFarcasterLink,
      verifyTelegramLink,
      verifyEmailOrPhoneLink,
      verifyLinkedAccount,
      linkAccountStatus,
      linkAccountError,
      setLinkAccountError,
      unlinkAccount,
      unlinkAccountConfirm,
      isUnlinkAccountPending,
      cancelLinkAccount,
      onAccountLinked,
      onAccountLinkVerified,
      resetMutations,
    ],
  );

  return <AccountLinkContext.Provider value={value}>{children}</AccountLinkContext.Provider>;
};

export const useAccountLinking = () => useContext(AccountLinkContext);
