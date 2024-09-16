import { Network } from '@usecapsule/web-sdk';
import { NETWORKS } from '../constants/constants.js';
import { CountryCallingCode, parsePhoneNumber } from 'libphonenumber-js';
import { format } from 'date-fns';

export const formatNetworkList = (networks: Network[]) => {
  return networks.length === 1
    ? NETWORKS[networks[0]]
    : `${networks
        .map(id => NETWORKS[id])
        .slice(0, -1)
        .join(', ')}${networks.length > 2 ? ',' : ''} and ${NETWORKS[networks[networks.length - 1]]}`;
};

export const formatPhoneNumber = (phone: string, countryCode: CountryCallingCode) => {
  const parsed = parsePhoneNumber(phone, { defaultCallingCode: countryCode });

  return parsed.formatNational();
};

export const formatWalletCreatedDate = (date: string) => `${format(new Date(date), 'M/d/y')}`;

export const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
