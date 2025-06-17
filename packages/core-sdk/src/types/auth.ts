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

export enum AccountLinkError {
  NotAuthenticated = 'No user is currently authenticated',
  Conflict = 'Account already linked',
  Canceled = 'Account linking was canceled',
  Unknown = 'An unknown error occurred',
}
