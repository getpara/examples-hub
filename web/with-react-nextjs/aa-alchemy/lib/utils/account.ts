// Account type from Para SDK's internal types
type Account = {
  isConnected: boolean;
  isGuestMode?: boolean;
  externalWalletAddress?: string;
  // other fields not needed for our use case
};

export function isConnectedAccount(
  acc: Account | undefined
): acc is Account & { isConnected: true; isGuestMode: false; externalWalletAddress: string } {
  return !!acc && acc.isConnected && !acc.isGuestMode && !!acc.externalWalletAddress;
}

export function getEOAAddress(
  account: Account | undefined | null,
  wallet: { address?: string } | undefined | null
): string | undefined {
  // If connected with external wallet (MetaMask, etc.)
  if (account?.isConnected && !account.isGuestMode && account.externalWalletAddress) {
    return account.externalWalletAddress;
  }
  
  // If connected with Para wallet
  if (wallet?.address) {
    return wallet.address;
  }
  
  return undefined;
}