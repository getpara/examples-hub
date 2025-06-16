import { ExternalWalletInfo, TLinkedAccountType } from '@getpara/user-management-client';

export type AccountLinkInProgress = {
  id: string;
  type: TLinkedAccountType;
  identifier?: string;
  isComplete: boolean;
  externalWallet?: ExternalWalletInfo & {
    signatureVerificationMessage: string;
  };
};

export const ACCOUNT_LINK_ERRORS = ['NOT_AUTHENTICATED', 'CONFLICT', 'CANCELED', 'UNKNOWN'] as const;

export type AccountLinkError = (typeof ACCOUNT_LINK_ERRORS)[number];
