import { useQuery } from '@tanstack/react-query';
import { useAccount, useClient, useWallet, useWalletState } from '../index.js';
import { GetWalletBalanceParams } from '@getpara/web-sdk';
import { useStore } from '../../stores/useStore.js';
import { getWalletBalance } from '../../actions/index.js';
import { useExternalWallets } from '../../providers/ExternalWalletProvider.js';
import { useCallback } from 'react';

export const WALLET_BALANCE_BASE_KEY = 'PARA_WALLET_BALANCE';

/**
 * Hook for retrieving a wallet balance
 */
export const useWalletBalance = (args?: Partial<GetWalletBalanceParams>) => {
  const client = useClient();
  const { data: selectedWallet } = useWallet();
  const {
    selectedWallet: { type: selectedWalletType },
  } = useWalletState();
  const { data: account } = useAccount();
  const rpcUrl = useStore(state => state.rpcUrl);
  const { getWalletBalance: getExternalWalletBalance, chainId } = useExternalWallets();

  const queryFn = useCallback(async () => {
    const skipGetBalance = !selectedWallet || (selectedWalletType && ['COSMOS', 'SOLANA'].includes(selectedWalletType));

    if (skipGetBalance) {
      return;
    }

    try {
      if (selectedWallet.isExternal) {
        return await getExternalWalletBalance();
      } else {
        const completeArgs: GetWalletBalanceParams = { walletId: selectedWallet?.id ?? '', rpcUrl: rpcUrl, ...args };

        return await getWalletBalance(client, completeArgs);
      }
    } catch (err) {
      console.error('Error fetching wallet balance: ', err);
    }
  }, [account, selectedWallet, selectedWalletType, rpcUrl, getExternalWalletBalance]);

  return useQuery({
    queryKey: [WALLET_BALANCE_BASE_KEY, selectedWallet?.id, selectedWalletType, selectedWallet?.isExternal ? chainId : ''],
    queryFn: queryFn,
    enabled: !!selectedWallet && !!rpcUrl && !!account?.isConnected,
  });
};
