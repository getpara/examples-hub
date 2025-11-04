import { useUserStore } from '@/store/useUserStore';
import { useAccount, useClient, Wallet } from '@getpara/react-sdk';
import { useEffect, useState } from 'react';

export const useSelectedWallet = () => {
  const { isConnected } = useAccount();
  const para = useClient();
  const currentWalletId = useUserStore(state => state.currentWalletId);
  const [wallet, setWallet] = useState<Wallet & { cosmosAddress?: string }>();

  useEffect(() => {
    const loadWallet = async () => {
      if (!isConnected || !para) {
        setWallet(undefined);
        return;
      }

      const wallet: Wallet & { cosmosAddress?: string } = currentWalletId
        ? para.wallets[currentWalletId]
        : Object.values(para.wallets)[0];

      if (!wallet) {
        setWallet(undefined);
        return;
      }

      if (wallet?.type === 'COSMOS') {
        await para.setWallets({
          ...para.wallets,
          [wallet.id]: { ...wallet, type: 'EVM' as any },
        });
      }

      setWallet({
        ...wallet,
        type: wallet?.type === 'SOLANA' ? ('SOLANA' as any) : ('EVM' as any),
      });
    };

    loadWallet();
  }, [currentWalletId, isConnected]);

  return { wallet };
};
