import { useMemo } from 'react';
import { useWalletState } from '../../provider/index.js';
import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';

// TODO: remove this hook in favor of the useAccount hook once we force the use of the ParaProvider
export function useActiveWallet() {
  const client = useInternalClient();
  const { selectedWallet } = useWalletState();

  return useMemo(() => {
    return client.findWallet(selectedWallet.id, selectedWallet.type, { forbidPregen: true });
  }, [client, selectedWallet]);
}
