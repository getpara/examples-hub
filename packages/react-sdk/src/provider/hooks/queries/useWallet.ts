import { useQuery } from '@tanstack/react-query';
import { useClient, useWalletState } from '../index.js';
import { useIsFullyLoggedIn } from './useAccount.js';
import { getWallet } from '../../actions/getWallet.js';

export const WALLET_BASE_KEY = 'PARA_WALLET';

/**
 * Hook for retrieving the selected wallet
 */
export const useWallet = () => {
  const client = useClient();
  const { selectedWallet } = useWalletState();
  const { data: isFullyLoggedIn, isSuccess } = useIsFullyLoggedIn();

  return useQuery({
    enabled: !!client && !!selectedWallet && isSuccess,
    queryKey: [WALLET_BASE_KEY, isFullyLoggedIn, selectedWallet.id, selectedWallet.type],
    queryFn: async () => await getWallet(client, selectedWallet, isFullyLoggedIn),
  });
};
