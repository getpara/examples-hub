import { Auth } from '@getpara/user-management-client';
import { EMAIL_REGEX } from '../constants/constants.js';
import { formatPhoneNumber } from '@getpara/web-sdk';
import countryCodes from './countryCodes.js';

export function isCcMatch(countryCode: string, option: (typeof countryCodes)[number]) {
  return countryCode === '+1' ? option.selectedLabel === 'US' : option.value === countryCode;
}

export function validateAuth(auth: Auth<'email' | 'phone'>): Auth<'email' | 'phone'> {
  switch (true) {
    case 'email' in auth:
      if (!EMAIL_REGEX.test(auth.email)) {
        throw new Error('Please enter a valid email address!');
      }
      break;

    case 'phone' in auth:
      {
        if (!/^\+1\d{3}555\d{4}$/.test(auth.phone)) {
          const formatted = formatPhoneNumber(auth.phone);

          if (!formatted) {
            throw new Error('Please enter a valid phone number!');
          }
        }
      }
      break;
  }
  return auth;
}

export function validateInput(identifier: string, countryCode?: string, type?: 'email' | 'phone') {
  const isEmail = type === 'email';
  const isPhone = type === 'phone';

  const auth = isEmail
    ? { email: identifier }
    : isPhone
      ? { phone: `${countryCode}${identifier}` as `+${number}` }
      : undefined;

  if (!auth) {
    throw new Error('Please enter a valid email or phone number!');
  }

  return validateAuth(auth);
}
