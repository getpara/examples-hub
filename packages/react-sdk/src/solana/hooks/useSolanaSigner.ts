import { useAccount, useClient, useWallet } from '@getpara/react-sdk-lite';
import { useQuery } from '@tanstack/react-query';
import { getSolanaSigner } from '../actions/index.js';
import { SolanaRpcApi } from '@solana/rpc-api';
import { Rpc } from '@solana/rpc-spec';

export const SOLANA_SIGNER_BASE_KEY = 'PARA_SOLANA_SIGNER';

type UseSolanaSignerParameters = {
  walletId?: string;
  rpc: Rpc<SolanaRpcApi>;
};

export const useSolanaSigner = ({ walletId, rpc }: UseSolanaSignerParameters) => {
  const para = useClient();
  const {
    isConnected,
    embedded: { userId },
  } = useAccount();
  const { data: wallet } = useWallet();

  const { data, isLoading } = useQuery({
    queryKey: [SOLANA_SIGNER_BASE_KEY, isConnected, userId, walletId ?? (wallet?.type === 'SOLANA' ? wallet?.id : null)],
    enabled: isConnected && !!para,
    queryFn: async () => {
      if (!isConnected || !para) {
        return null;
      }

      // If an id is provided, use it; otherwise, use the wallet's id if it's an Solana wallet, else use the first Solana wallet id
      const _id = walletId ?? (wallet?.type === 'SOLANA' ? wallet?.id : undefined);

      return await getSolanaSigner({ para, rpc, walletId: _id });
    },
  });

  return { solanaSigner: data, isLoading };
};
