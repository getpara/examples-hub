import { parsePhoneNumber } from 'libphonenumber-js';

export const formatPhoneNumber = (phone: string, countryCode: string) => {
  let _countryCode = countryCode;
  if (_countryCode.startsWith('+')) {
    _countryCode = _countryCode.split('+')[1];
  }
  const parsed = parsePhoneNumber(phone, { defaultCallingCode: _countryCode });

  return parsed.formatNational();
};
