import { EIP155_CHAINS, TEIP155Chain } from '@/data/EIP155Data';
import { toast } from '@getpara/react-component-library';

import { ethers } from 'ethers';

/**
 * Truncates string (in the middle) via given lenght value
 */
export function truncate(value: string, length: number) {
  if (value?.length <= length) {
    return value;
  }

  const separator = '...';
  const stringLength = length - separator.length;
  const frontLength = Math.ceil(stringLength / 2);
  const backLength = Math.floor(stringLength / 2);

  return value.substring(0, frontLength) + separator + value.substring(value.length - backLength);
}

/**
 * Converts hex to utf8 string if it is valid bytes
 */
export function convertHexToUtf8(value: string) {
  if (ethers.isHexString(value)) {
    return ethers.toUtf8String(value);
  }

  return value;
}

/**
 * Gets message from various signing request methods by filtering out
 * a value that is not an address (thus is a message).
 * If it is a hex string, it gets converted to utf8 string
 */
export function getSignParamsMessage(params: string[]) {
  const message = params.filter(p => !ethers.isAddress(p))[0];

  return convertHexToUtf8(message);
}

/**
 * Gets data from various signTypedData request methods by filtering out
 * a value that is not an address (thus is data).
 * If data is a string convert it to object
 */
export function getSignTypedDataParamsData(params: string[]) {
  const data = params.filter(p => !ethers.isAddress(p))[0];

  if (typeof data === 'string') {
    return JSON.parse(data);
  }

  return data;
}

/**
 * Get our address from params checking if params string contains one
 * of our wallet addresses
 */
export function getWalletAddressFromParams(addresses: string[], params: any) {
  const paramsString = JSON.stringify(params);
  let address = '';

  addresses.forEach(addr => {
    if (paramsString.toLowerCase().includes(addr.toLowerCase())) {
      address = addr;
    }
  });

  return address;
}

/**
 * Check if chain is part of EIP155 standard
 */
export function isEIP155Chain(chain: string) {
  return chain.includes('eip155');
}

/**
 * Check if chain is part of KADENA standard
 */
export function isKadenaChain(chain: string) {
  return chain.includes('kadena');
}

/**
 * Formats chainId to its name
 */
export function formatChainName(chainId: string) {
  return EIP155_CHAINS[chainId as TEIP155Chain]?.name ?? chainId;
}

export function styledToast(message: string, type: 'success' | 'error', id?: string) {
  if (type === 'success') {
    toast('Success!', {
      id,
      description: message,
      position: 'bottom-right',
      icon: null,
      classNames: { title: 'para:!text-green-600' },
    });
  } else if (type === 'error') {
    toast('Error!', {
      id,
      description: message,
      position: 'bottom-right',
      icon: null,
      classNames: { title: 'para:!text-destructive' },
    });
  }
}
