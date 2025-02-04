import { useState } from 'react';
import { STORAGE_PREFIX, Wallet } from '@getpara/web-sdk';

const useWalletsState = (initialValue: Pick<Wallet, 'address' | 'id'>[] | null) => {
  const [state, setState] = useState<Pick<Wallet, 'address' | 'id'>[] | null>(() => {
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}wallets`);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  const setWallets = (value: Pick<Wallet, 'address' | 'id'>[] | null) => {
    setState(value);

    if (value === null) {
      localStorage.removeItem(`${STORAGE_PREFIX}wallets`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}wallets`, JSON.stringify(value));
    }
  };

  return [state, setWallets] as const;
};

export default useWalletsState;
