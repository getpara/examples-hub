import { useState } from 'react';
import { STORAGE_PREFIX } from '@usecapsule/core-sdk';

const useTwoFactorVerifiedState = (initialValue: boolean | null) => {
  const [state, setState] = useState<boolean | null>(() => {
    const storedValue = sessionStorage.getItem(`${STORAGE_PREFIX}useTwoFactorVerified`);
    if (storedValue === null) {
      return initialValue;
    }
    return storedValue === 'true';
  });

  const setuseTwoFactorVerified = (value: boolean) => {
    setState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}useTwoFactorVerified`, String(value));
  };

  return [state, setuseTwoFactorVerified] as const;
};

export default useTwoFactorVerifiedState;
