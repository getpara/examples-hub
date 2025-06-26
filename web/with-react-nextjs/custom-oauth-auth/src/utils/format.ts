export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
}

export function truncateSignature(signature: string, length = 20): string {
  if (signature.length <= length * 2) {
    return signature;
  }
  return `${signature.substring(0, length)}...${signature.substring(signature.length - length)}`;
}