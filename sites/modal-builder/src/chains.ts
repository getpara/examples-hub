/**
 * Local chain definitions for Cosmos chains.
 * These are simplified versions of the chain configs from graz/chains,
 * extracted to avoid dependency on graz -g chain generation.
 */

export const cosmoshub = {
  chainId: 'cosmoshub-4',
  chainName: 'cosmoshub',
  rpc: 'https://rpc.cosmos.directory/cosmoshub',
  rest: 'https://rest.cosmos.directory/cosmoshub',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'cosmos',
    bech32PrefixAccPub: 'cosmospub',
    bech32PrefixValAddr: 'cosmosvaloper',
    bech32PrefixValPub: 'cosmosvaloperpub',
    bech32PrefixConsAddr: 'cosmosvalcons',
    bech32PrefixConsPub: 'cosmosvalconspub',
  },
  currencies: [
    {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.03,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'ATOM',
    coinMinimalDenom: 'uatom',
    coinDecimals: 6,
    coinGeckoId: 'cosmos',
  },
};

export const osmosis = {
  chainId: 'osmosis-1',
  chainName: 'osmosis',
  rpc: 'https://rpc.cosmos.directory/osmosis',
  rest: 'https://rest.cosmos.directory/osmosis',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'osmo',
    bech32PrefixAccPub: 'osmopub',
    bech32PrefixValAddr: 'osmovaloper',
    bech32PrefixValPub: 'osmovaloperpub',
    bech32PrefixConsAddr: 'osmovalcons',
    bech32PrefixConsPub: 'osmovalconspub',
  },
  currencies: [
    {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      gasPriceStep: {
        low: 0.0025,
        average: 0.025,
        high: 0.04,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'OSMO',
    coinMinimalDenom: 'uosmo',
    coinDecimals: 6,
    coinGeckoId: 'osmosis',
  },
};

export const axelar = {
  chainId: 'axelar-dojo-1',
  chainName: 'axelar',
  rpc: 'https://rpc.cosmos.directory/axelar',
  rest: 'https://rest.cosmos.directory/axelar',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'axelar',
    bech32PrefixAccPub: 'axelarpub',
    bech32PrefixValAddr: 'axelarvaloper',
    bech32PrefixValPub: 'axelarvaloperpub',
    bech32PrefixConsAddr: 'axelarvalcons',
    bech32PrefixConsPub: 'axelarvalconspub',
  },
  currencies: [
    {
      coinDenom: 'AXL',
      coinMinimalDenom: 'uaxl',
      coinDecimals: 6,
      coinGeckoId: 'axelar',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'AXL',
      coinMinimalDenom: 'uaxl',
      coinDecimals: 6,
      coinGeckoId: 'axelar',
      gasPriceStep: {
        low: 0.007,
        average: 0.007,
        high: 0.01,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'AXL',
    coinMinimalDenom: 'uaxl',
    coinDecimals: 6,
    coinGeckoId: 'axelar',
  },
};

export const sommelier = {
  chainId: 'sommelier-3',
  chainName: 'sommelier',
  rpc: 'https://rpc.cosmos.directory/sommelier',
  rest: 'https://rest.cosmos.directory/sommelier',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'somm',
    bech32PrefixAccPub: 'sommpub',
    bech32PrefixValAddr: 'sommvaloper',
    bech32PrefixValPub: 'sommvaloperpub',
    bech32PrefixConsAddr: 'sommvalcons',
    bech32PrefixConsPub: 'sommvalconspub',
  },
  currencies: [
    {
      coinDenom: 'SOMM',
      coinMinimalDenom: 'usomm',
      coinDecimals: 6,
      coinGeckoId: 'sommelier',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'SOMM',
      coinMinimalDenom: 'usomm',
      coinDecimals: 6,
      coinGeckoId: 'sommelier',
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.04,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'SOMM',
    coinMinimalDenom: 'usomm',
    coinDecimals: 6,
    coinGeckoId: 'sommelier',
  },
};

export const stargaze = {
  chainId: 'stargaze-1',
  chainName: 'stargaze',
  rpc: 'https://rpc.cosmos.directory/stargaze',
  rest: 'https://rest.cosmos.directory/stargaze',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'stars',
    bech32PrefixAccPub: 'starspub',
    bech32PrefixValAddr: 'starsvaloper',
    bech32PrefixValPub: 'starsvaloperpub',
    bech32PrefixConsAddr: 'starsvalcons',
    bech32PrefixConsPub: 'starsvalconspub',
  },
  currencies: [
    {
      coinDenom: 'STARS',
      coinMinimalDenom: 'ustars',
      coinDecimals: 6,
      coinGeckoId: 'stargaze',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'STARS',
      coinMinimalDenom: 'ustars',
      coinDecimals: 6,
      coinGeckoId: 'stargaze',
      gasPriceStep: {
        low: 1,
        average: 1.1,
        high: 1.2,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'STARS',
    coinMinimalDenom: 'ustars',
    coinDecimals: 6,
    coinGeckoId: 'stargaze',
  },
};
