import parsePhoneNumberFromString from 'libphonenumber-js';

export function formatPhoneNumber(
  phone: string,
  countryCode?: string | undefined,
  opts?: { forDisplay: undefined | false },
): `+${number}` | null;

export function formatPhoneNumber(phone: string, countryCode: string | undefined, opts: { forDisplay: true }): string | null;

export function formatPhoneNumber(
  phone: string,
  countryCode?: string,
  { forDisplay = false }: { forDisplay?: boolean } = {},
): string | `+${number}` | null {
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
    sanitizedNumber = `+${phone.replace(/\D/g, '')}`;
    parsedNumber = parsePhoneNumberFromString(sanitizedNumber);
  }

  if (parsedNumber?.isValid()) {
    return forDisplay ? parsedNumber.formatInternational() : parsedNumber.formatInternational().replace(/[^\d+]/g, '');
  }
  return null;
}

export function displayPhoneNumber(phone: string, countryCode?: string): string {
  return formatPhoneNumber(phone, countryCode, { forDisplay: true });
}

export function splitPhoneNumber(phone: `+${number}`): { phone: string; countryCode: string } {
  const parsedNumber = parsePhoneNumberFromString(phone);
  if (parsedNumber?.isValid()) {
    return {
      phone: parsedNumber.nationalNumber.replace(/\D/g, ''),
      countryCode: `+${parsedNumber.countryCallingCode}`,
    };
  }

  throw new Error('Invalid phone number');
}
