import { TExternalWallet, TWalletType } from '@getpara/web-sdk';
import { ModalLinkAccountArgs, useAccountLinking } from '../../providers/AccountLinkProvider.js';

/**
 * Arguments for linking accounts via modal
 * @example
 * // Open modal for user to select link type
 * linkAccount()
 *
 * @example
 * // Link with email
 * linkAccount({ auth: { email: "user@example.com" } })
 *
 * @example
 * // Link specific account type
 * linkAccount({ type: "TWITTER" })
 *
 * @example
 * // Link external wallet and allow user to select type
 * linkAccount({ externalWallet: { provider: "METAMASK" } })
 * OR
 * // Link external wallet with specific type
 * linkAccount({ externalWallet: { provider: "METAMASK", type: "EVM" } })
 */
export type LinkAccountArgs =
  | Omit<ModalLinkAccountArgs, 'externalWallet'>
  | {
      externalWallet: { provider: TExternalWallet; type?: TWalletType };
    }
  | undefined;

export const useLinkAccount = () => {
  const { linkAccount, linkAccountError, linkAccountStatus } = useAccountLinking();

  return {
    linkAccount: (args: LinkAccountArgs) => {
      return linkAccount(args as ModalLinkAccountArgs);
    },
    error: linkAccountError,
    status: linkAccountStatus,
    isPending: linkAccountStatus === 'pending',
    isError: linkAccountStatus === 'error',
    isIdle: linkAccountStatus === 'idle',
    isSuccess: linkAccountStatus === 'success',
  };
};
