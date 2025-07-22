import { useAccount, useClient, useWallet } from '@getpara/react-sdk-lite';
import { useQuery } from '@tanstack/react-query';
import { getCosmjsProtoSigner } from '../actions/index.js';

export const COSMJS_PROTO_SIGNER_BASE_KEY = 'PARA_COSMJS_PROTO_SIGNER';

type UseCosmjsProtoSignerParameters = {
  prefix?: string;
  walletId?: string;
  messageSigningTimeoutMs?: number;
};

export const useCosmjsProtoSigner = ({ prefix, walletId, messageSigningTimeoutMs }: UseCosmjsProtoSignerParameters = {}) => {
  const para = useClient();
  const {
    isConnected,
    embedded: { userId },
  } = useAccount();
  const { data: wallet } = useWallet();

  const { data, isLoading } = useQuery({
    queryKey: [
      COSMJS_PROTO_SIGNER_BASE_KEY,
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

      return await getCosmjsProtoSigner({ para, walletId: _id, prefix, messageSigningTimeoutMs });
    },
  });

  return { protoSigner: data, isLoading };
};
