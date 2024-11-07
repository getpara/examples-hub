import { useMemo } from 'react';
import { useCapsuleStore, useModalStore } from '../stores/index.js';

export function useActiveWallet() {
  const capsule = useCapsuleStore(state => state.capsule);
  const [activeWalletId, activeWalletType] = useModalStore(state => state.activeWallet);

  return useMemo(() => {
    return capsule.findWallet(activeWalletId, activeWalletType, { forbidPregen: true });
  }, [capsule, activeWalletId, activeWalletType]);
}
