import { useClient } from '@getpara/react-sdk-lite';
import { useViemAccount } from './useViemAccount.js';
import { createParaViemClient } from '@getpara/viem-v2-integration';
import { useQuery } from '@tanstack/react-query';
import { WalletClientConfig } from 'viem';

export const VIEM_CLIENT_BASE_KEY = 'PARA_VIEM_CLIENT';

type UseViemClientParameters = {
  address?: `0x${string}`;
  walletClientConfig: Omit<WalletClientConfig, 'account'>;
};

export const useViemClient = ({ address, walletClientConfig }: UseViemClientParameters) => {
  const para = useClient();
  const { viemAccount } = useViemAccount({ address });

  const { data, isLoading } = useQuery({
    queryKey: [VIEM_CLIENT_BASE_KEY, viemAccount, address, walletClientConfig],
    enabled: !!viemAccount && !!para,
    queryFn: async () => {
      if (!para || !viemAccount) {
        return null;
      }

      return await createParaViemClient(para, { ...walletClientConfig, account: viemAccount });
    },
  });

  return { viemClient: data, isLoading };
};
