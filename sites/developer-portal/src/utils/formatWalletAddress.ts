export const formatWalletAddress = (address: string) =>
  address.length < 12 ? address : `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}`;
