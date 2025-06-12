import { WalletList } from '../types/Wallet.js';
import { allWallets } from '../wallets/connectors/index.js'; // already exported by the lib
import { TExternalWallet } from '@getpara/react-common';

export function resolveWalletList(wallets: WalletList | TExternalWallet[] | undefined): WalletList {
  if (!wallets || !wallets.length) return [];

  if (typeof wallets[0] === 'function') return wallets as WalletList;

  const ids = wallets as TExternalWallet[];
  const resolved: WalletList = allWallets.filter(createWalletFn => {
    const meta = createWalletFn({ projectId: '', appName: '' });
    return ids.includes(meta.id.toUpperCase() as TExternalWallet);
  });

  return resolved;
}
