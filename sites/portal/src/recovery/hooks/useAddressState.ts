import { useState } from 'react';
import { STORAGE_PREFIX } from '@usecapsule/web-sdk';

const useAddressState = (initialValue: string | null) => {
  const [state, setState] = useState<string | null>(() => {
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}address`);
    return storedValue !== null ? storedValue : initialValue;
  });

  const setAddress = (value: string | null) => {
    setState(value);

    if (value === null) {
      localStorage.removeItem(`${STORAGE_PREFIX}address`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}address`, value);
    }
  };

  return [state, setAddress] as const;
};

export default useAddressState;
