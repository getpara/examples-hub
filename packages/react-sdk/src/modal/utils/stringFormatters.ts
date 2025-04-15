import { Network } from '@getpara/web-sdk';
import { getNetworkName } from '../constants/constants.js';
import { format } from 'date-fns';

export const formatNetworkList = (networks: Network[]) => {
  return networks.length === 1
    ? getNetworkName(networks[0])
    : `${networks
        .map(id => getNetworkName(id))
        .slice(0, -1)
        .join(', ')}${networks.length > 2 ? ',' : ''} and ${getNetworkName(networks[networks.length - 1])}`;
};

export const formatWalletCreatedDate = (date: string) => `${format(new Date(date), 'M/d/y')}`;

export const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export const formatBalanceString = (str: string) => {
  const numericBalance = parseFloat(str);

  return `$${numericBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};
