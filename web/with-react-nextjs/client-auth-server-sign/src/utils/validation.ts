export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount: string): boolean {
  const amountFloat = parseFloat(amount);
  return !isNaN(amountFloat) && amountFloat > 0;
}