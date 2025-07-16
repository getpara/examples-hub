import { useAccountLinking } from '../../providers/AccountLinkProvider.js';

export const useLinkAccount = () => {
  const { linkAccount, linkAccountError, linkAccountStatus } = useAccountLinking();

  return {
    linkAccount,
    error: linkAccountError,
    status: linkAccountStatus,
    isPending: linkAccountStatus === 'pending',
    isError: linkAccountStatus === 'error',
    isIdle: linkAccountStatus === 'idle',
    isSuccess: linkAccountStatus === 'success',
  };
};
