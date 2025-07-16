import { ParaModalHandle, ParaProviderProps, ParaProvider as ParaProviderMin } from '@getpara/react-sdk-lite';
import { forwardRef } from 'react';
import { Chain, Transport } from 'viem';

export const ParaProvider = forwardRef<
  ParaModalHandle,
  ParaProviderProps<readonly [Chain, ...Chain[]], Record<[Chain, ...Chain[]][number]['id'], Transport>>
>(({ children, externalWalletConfig, ...providerProps }, ref) => {
  return (
    <ParaProviderMin
      {...providerProps}
      // If wallets aren't configured in this SDK we don't want to show any defaults
      externalWalletConfig={{ ...externalWalletConfig, wallets: externalWalletConfig?.wallets ?? [] }}
      ref={ref}
    >
      {children}
    </ParaProviderMin>
  );
});
