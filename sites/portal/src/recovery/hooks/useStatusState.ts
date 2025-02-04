import { useState } from 'react';
import { STORAGE_PREFIX } from '@getpara/web-sdk';
import type { RecoveryStatus } from '@getpara/web-sdk';

const useStatusState = (initialValue: RecoveryStatus | null) => {
  const [state, setState] = useState<RecoveryStatus | null>(() => {
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}status`);
    return storedValue !== null ? (storedValue as RecoveryStatus) : initialValue;
  });

  const setStatus = (value: RecoveryStatus | null) => {
    setState(value);

    if (value === null) {
      localStorage.removeItem(`${STORAGE_PREFIX}status`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}status`, value);
    }
  };

  return [state, setStatus] as const;
};

export default useStatusState;
