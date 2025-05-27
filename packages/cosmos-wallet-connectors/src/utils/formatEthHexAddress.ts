export function formatEthHexAddress(address: Uint8Array): string {
  return `0x${Buffer.from(address).toString('hex')}`.toLowerCase();
}
