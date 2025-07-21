import { useAccount, useClient, useWallet } from '@getpara/react-sdk-lite';
import { useQuery } from '@tanstack/react-query';
import { getViemAccount } from '../actions/index.js';

export const VIEM_ACCOUNT_BASE_KEY = 'PARA_VIEM_ACCOUNT';

type UseViemAccountParameters = {
  address?: `0x${string}`;
};

export const useViemAccount = ({ address }: UseViemAccountParameters = {}) => {
  const para = useClient();
  const {
    isConnected,
    embedded: { userId },
  } = useAccount();
  const { data: wallet } = useWallet();

  const { data, isLoading } = useQuery({
    queryKey: [VIEM_ACCOUNT_BASE_KEY, isConnected, userId, address ?? (wallet?.type === 'EVM' ? wallet?.address : null)],
    enabled: isConnected && !!para,
    queryFn: async () => {
      if (!isConnected || !para) {
        return null;
      }

      // If an address is provided, use it; otherwise, use the wallet's address if it's an EVM wallet, else use the first EVM wallet address
      const _address = address ?? (wallet?.type === 'EVM' ? (wallet?.address as `0x${string}`) : undefined);

      return await getViemAccount({ para, address: _address });
    },
  });

  return { viemAccount: data, isLoading };
};
