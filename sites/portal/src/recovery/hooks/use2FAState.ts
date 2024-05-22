import { useState } from 'react';
import { STORAGE_PREFIX } from '@usecapsule/react-sdk';

const use2FAState = (initialValue: boolean | null) => {
  const [state, setState] = useState<boolean | null>(() => {
    const storedValue = sessionStorage.getItem(`${STORAGE_PREFIX}use2FA`);
    if (storedValue === null) {
      return initialValue;
    }
    return storedValue === 'true';
  });

  const setUse2FA = (value: boolean) => {
    setState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}use2FA`, String(value));
  };

  return [state, setUse2FA] as const;
};

export default use2FAState;
