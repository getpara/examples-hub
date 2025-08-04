import { forwardRef } from 'react';
import { ParaProviderProps } from './types/provider.js';
import { Chain, Transport } from 'viem';
import { ParaModalHandle } from '../modal/index.js';
import { ParaProviderMin } from './ParaProviderMin.js';
import { COSMOS_CONFIG_DEFAULT, EVM_CONFIG_DEFAULT, SOLANA_CONFIG_DEFAULT } from './utils/constants.js';

export const ParaProvider = forwardRef<
  ParaModalHandle,
  ParaProviderProps<readonly [Chain, ...Chain[]], Record<[Chain, ...Chain[]][number]['id'], Transport>>
>(({ externalWalletConfig, ...config }, ref) => {
  return (
    <ParaProviderMin
      ref={ref}
      {...config}
      externalWalletConfig={{
        ...externalWalletConfig,
        evmConnector: {
          ...externalWalletConfig?.evmConnector,
          config: externalWalletConfig?.evmConnector?.config || EVM_CONFIG_DEFAULT,
        },
        cosmosConnector: {
          ...externalWalletConfig?.cosmosConnector,
          config: externalWalletConfig?.cosmosConnector?.config || COSMOS_CONFIG_DEFAULT,
        },
        solanaConnector: {
          ...externalWalletConfig?.solanaConnector,
          config: externalWalletConfig?.solanaConnector?.config || SOLANA_CONFIG_DEFAULT,
        },
      }}
    />
  );
});
