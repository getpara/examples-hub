import React from 'react';
import emptyFunction from '../emptyFunction';
import { Wallet } from '@usecapsule/web-sdk';

interface WalletContextType {
  wallets: Pick<Wallet, 'address' | 'id'>[] | null;
  setWallets: (wallets: Pick<Wallet, 'address' | 'id'>[] | null) => void;
}

const WalletContext = React.createContext<WalletContextType>({
  wallets: null,
  setWallets: emptyFunction,
});

export default WalletContext;
