import { useState } from 'react';
import { STORAGE_PREFIX } from '@getpara/web-sdk';

const useWalletIdState = (initialValue: string | null) => {
  const [state, setState] = useState<string | null>(() => {
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}walletId`);
    return storedValue !== null ? storedValue : initialValue;
  });

  const setWalletId = (value: string | null) => {
    setState(value);

    if (value === null) {
      localStorage.removeItem(`${STORAGE_PREFIX}walletId`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}walletId`, value);
    }
  };

  return [state, setWalletId] as const;
};

export default useWalletIdState;
