import { useAccount } from '@getpara/react-sdk';
import { useQuery } from '@tanstack/react-query';
import { walletKit } from '../utils/WalletConnectUtil';

export const ACTIVE_SESSIONS_BASE_QUERY_KEY = 'activeSessions';

export const useActiveSessions = () => {
  const {
    embedded: { userId },
  } = useAccount();

  return useQuery({
    queryKey: [ACTIVE_SESSIONS_BASE_QUERY_KEY, userId],
    queryFn: async () => {
      return walletKit.getActiveSessions();
    },
  });
};
