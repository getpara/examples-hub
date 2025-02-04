import { useState } from 'react';
import { STORAGE_PREFIX } from '@getpara/web-sdk';

const useEmailState = (initialValue: string | null) => {
  // Try to get the value from local storage first, and if it's not available, use the initial value
  const [state, setState] = useState<string | null>(() => {
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}email`);
    return storedValue !== null ? storedValue : initialValue;
  });

  const setEmail = (value: string | null) => {
    setState(value);

    if (value === null) {
      localStorage.removeItem(`${STORAGE_PREFIX}email`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}email`, value);
    }
  };

  return [state, setEmail] as const;
};

export default useEmailState;
