export enum EvmWallet {
  METAMASK = 'METAMASK',
  RAINBOW = 'RAINBOW',
  COINBASE = 'COINBASE',
  WALLETCONNECT = 'WALLETCONNECT',
  ZERION = 'ZERION',
}

// export enum SolanaWallet {
//   PHANTOM = 'PHANTOM',
//   GLOW = 'GLOW',
// }

// export enum CosmosWallet {
//   KEPLR = 'KEPLR',
//   LEAP = 'LEAP',
// }

export const ExternalWallet = {
  ...EvmWallet,
  // ...SolanaWallet,
  // ...CosmosWallet
};

export type TExternalWallet = keyof typeof ExternalWallet;
