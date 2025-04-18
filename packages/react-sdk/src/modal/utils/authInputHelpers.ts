import { Auth } from '@getpara/user-management-client';
import { EMAIL_REGEX } from '../constants/constants.js';
import { formatPhoneNumber } from '@getpara/web-sdk';
import countryCodes from './countryCodes.js';

export function isCcMatch(countryCode: string, option: (typeof countryCodes)[number]) {
  return countryCode === '+1' ? option.selectedLabel === 'US' : option.value === countryCode;
}

export function validateAuth(identifier: string, countryCode?: string, type?: 'email' | 'phone') {
  const isEmail = type === 'email';
  const isPhone = type === 'phone';

  let auth: Auth<'email'> | Auth<'phone'>;

  switch (true) {
    case isEmail:
      if (!EMAIL_REGEX.test(identifier)) {
        throw new Error('Please enter a valid email!');
      }
      auth = { email: identifier };
      break;
    case isPhone:
      if (countryCode === '+1' && identifier.slice(3, 6) === '555') {
        auth = { phone: `${countryCode}${identifier}` as `+${number}` };
        break;
      }

      const validatedPhone = formatPhoneNumber(identifier, countryCode);

      if (!validatedPhone) {
        throw new Error('Please enter a valid phone number!');
      }

      auth = { phone: validatedPhone };

      break;
    default:
      throw new Error('Please enter a valid email or phone number!');
  }

  return auth;
}
