import { useAccount, useClient, useWallet } from '@getpara/react-sdk-lite';
import { useQuery } from '@tanstack/react-query';
import { getCosmjsAminoSigner } from '../actions/index.js';

export const COSMJS_AMINO_SIGNER_BASE_KEY = 'PARA_COSMJS_AMINO_SIGNER';

type UseCosmjsAminoSignerParameters = {
  prefix?: string;
  walletId?: string;
  messageSigningTimeoutMs?: number;
};

export const useCosmjsAminoSigner = ({ prefix, walletId, messageSigningTimeoutMs }: UseCosmjsAminoSignerParameters = {}) => {
  const para = useClient();
  const {
    isConnected,
    embedded: { userId },
  } = useAccount();
  const { data: wallet } = useWallet();

  const { data, isLoading } = useQuery({
    queryKey: [
      COSMJS_AMINO_SIGNER_BASE_KEY,
      isConnected,
      userId,
      walletId ?? (wallet?.type === 'COSMOS' ? wallet?.id : null),
    ],
    enabled: isConnected && !!para,
    queryFn: async () => {
      if (!isConnected || !para) {
        return null;
      }

      // If an id is provided, use it; otherwise, use the selected wallet's id if it's a Cosmos wallet, else use the first Cosmos wallet address
      const _id = walletId ?? (wallet?.type === 'COSMOS' ? wallet?.id : undefined);

      return await getCosmjsAminoSigner({ para, walletId: _id, prefix, messageSigningTimeoutMs });
    },
  });

  return { aminoSigner: data, isLoading };
};
