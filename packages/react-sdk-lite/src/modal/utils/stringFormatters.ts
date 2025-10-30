import { TNetwork } from '@getpara/web-sdk';
import { getNetworkName } from '@getpara/react-common';
import { format } from 'date-fns';

export const formatNetworkList = (networks: TNetwork[]) => {
  if (networks.length === 0) {
    return '';
  }

  if (networks.length === 1) {
    return getNetworkName(networks[0]);
  }

  const networkNames = networks.map(id => getNetworkName(id));
  const allButLast = networkNames.slice(0, -1);
  const last = networkNames[networkNames.length - 1];

  return `${allButLast.join(', ')}${networks.length > 2 ? ',' : ''} and ${last}`;
};

export const formatWalletCreatedDate = (date: string) => `${format(new Date(date), 'M/d/y')}`;

export const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
