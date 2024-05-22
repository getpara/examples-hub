import { STORAGE_PREFIX } from '@usecapsule/core-sdk';
import { useState } from 'react';

const usePhoneState = (initialValue: string | null) => {
  // Try to get the value from local storage first, and if it's not available, use the initial value
  const [state, setState] = useState<string | null>(() => {
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}phone`);
    return storedValue !== null ? storedValue : initialValue;
  });

  const setPhone = (value: string | null) => {
    setState(value);

    if (value === null) {
      localStorage.removeItem(`${STORAGE_PREFIX}phone`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}phone`, value);
    }
  };

  return [state, setPhone] as const;
};

export default usePhoneState;
