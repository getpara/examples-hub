import { useQuery } from '@tanstack/react-query';
import { useClient, useWalletState } from '../index.js';
import { getWallet } from '../../actions/getWallet.js';

export const WALLET_BASE_KEY = 'PARA_WALLET';

/**
 * Hook for retrieving the selected wallet
 */
export const useWallet = () => {
  const client = useClient();
  const { selectedWallet } = useWalletState();

  return useQuery({
    queryKey: [WALLET_BASE_KEY, client?.getUserId(), selectedWallet.id, selectedWallet.type],
    queryFn: async () => await getWallet(client, selectedWallet),
  });
};
