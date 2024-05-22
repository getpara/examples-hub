import { createContext } from 'react';
import emptyFunction from '../emptyFunction';
import { CountryCallingCode } from 'libphonenumber-js';

interface PhoneContextType {
  phone: string | null;
  setPhone: (phone: string | null) => void;
  countryCode: CountryCallingCode | null;
  setCountryCode: (countryCode: CountryCallingCode | null) => void;
}

const PhoneContext = createContext<PhoneContextType>({
  phone: null,
  setPhone: emptyFunction,
  countryCode: null,
  setCountryCode: emptyFunction,
});

export default PhoneContext;
