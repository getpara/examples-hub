import { STORAGE_PREFIX } from '@usecapsule/core-sdk';
import { useState } from 'react';
import { CountryCallingCode } from 'libphonenumber-js';

const useCountryCodeState = (initialValue: CountryCallingCode | null) => {
  const [state, setState] = useState<CountryCallingCode | null>(() => {
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}countryCode`);
    return storedValue !== null ? (storedValue as CountryCallingCode) : initialValue;
  });

  const setCountryCode = (value: CountryCallingCode | null) => {
    setState(value);

    if (value === null) {
      localStorage.removeItem(`${STORAGE_PREFIX}countryCode`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}countryCode`, value);
    }
  };

  return [state, setCountryCode] as const;
};

export default useCountryCodeState;
