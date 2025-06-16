import ParaWeb from '@getpara/web-sdk';

const WALLET_TYPES = {
  EVM: 'EVM',
  SOLANA: 'Solana',
  COSMOS: 'Cosmos',
};

export function getWalletDisplayName(
  para: ParaWeb,
  {
    type,
    isExternal,
    name,
    isMenu = false,
    hideWallets = false,
  }: Partial<
    Pick<(typeof para.availableWallets)[0], 'type' | 'isExternal' | 'name'> & {
      isMenu?: boolean;
      hideWallets?: boolean;
    }
  >,
) {
  if (para.isMultiWallet) {
    return (
      name ??
      `${isExternal ? 'External ' : ''}${type ? WALLET_TYPES[type] : ''}${!hideWallets && (isMenu || isExternal) ? ' Wallet' : ''}`
    );
  }

  return hideWallets ? 'My Account' : name || 'My Wallet';
}
