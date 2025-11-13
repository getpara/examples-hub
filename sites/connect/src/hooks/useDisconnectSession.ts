import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletKit } from '../utils/WalletConnectUtil';
import { ACTIVE_SESSIONS_BASE_QUERY_KEY } from './useActiveSessions';
import { getSdkError } from '@walletconnect/utils';
import { styledToast } from '../utils/HelperUtil';

export const useDisconnectSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topics: string[]) => {
      const promises = topics.map(topic => walletKit.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') }));
      return Promise.all(promises);
    },
    onError: error => {
      styledToast('Failed to disconnect session', 'error');
      console.error('Error disconnecting session:', error);
    },
    onSettled: () => {
      // Invalidate active sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: [ACTIVE_SESSIONS_BASE_QUERY_KEY], exact: false });
    },
  });
};
