import parsePhoneNumberFromString from 'libphonenumber-js';

export const formatPhoneNumber = (phone: string, countryCode?: string): string | null => {
  phone = phone.toString();
  countryCode = countryCode?.toString();

  let sanitizedNumber, parsedNumber;
  if (!!countryCode) {
    sanitizedNumber = phone.replace(/\D/g, '');
    if (/^\+\d+$/.test(countryCode)) {
      countryCode = countryCode.slice(1);
    }

    parsedNumber = parsePhoneNumberFromString(sanitizedNumber, { defaultCallingCode: countryCode });
  } else {
    sanitizedNumber = `${phone.startsWith('+') ? '' : '+'}${phone.replace(/[^\d+]/g, '')}`;
    parsedNumber = parsePhoneNumberFromString(sanitizedNumber);
  }

  if (parsedNumber?.isValid()) {
    return parsedNumber.formatInternational();
  }
  return null;
};
