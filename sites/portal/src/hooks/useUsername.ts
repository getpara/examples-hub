import { formatPhoneNumber } from '@usecapsule/react-common';
import { CountryCallingCode } from 'libphonenumber-js';
import { useSearchParams } from 'react-router-dom';

export const useUsername = () => {
  const [searchParams] = useSearchParams();

  const paramsEmail = searchParams.get('email') ? decodeURIComponent(searchParams.get('email')) : undefined;
  const paramsPhone = searchParams.get('phone') ? decodeURIComponent(searchParams.get('phone')) : undefined;
  const paramsCountryCode = searchParams.get('countryCode')
    ? (decodeURIComponent(searchParams.get('countryCode')) as CountryCallingCode)
    : undefined;
  const paramsFarcasterUsername = searchParams.get('farcasterUsername')
    ? decodeURIComponent(searchParams.get('farcasterUsername'))
    : undefined;

  return paramsEmail ?? (paramsPhone ? formatPhoneNumber(paramsPhone, paramsCountryCode) : (paramsFarcasterUsername ?? ''));
};
