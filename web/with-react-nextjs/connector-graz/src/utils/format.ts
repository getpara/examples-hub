export function formatBalance(balance: string): string {
  return parseFloat(balance).toFixed(4);
}

export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
}