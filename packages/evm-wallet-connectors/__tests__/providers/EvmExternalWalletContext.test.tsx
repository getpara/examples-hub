import { describe, expect, it } from 'vitest';

import { render } from '@testing-library/react';
import { ParaEvmProvider } from '../../src/providers/ParaEvmContext';
import { EvmExternalWalletContext } from '../../src/providers/EvmExternalWalletContext';
import { useContext, useEffect } from 'react';
import { Environment } from '@getpara/web-sdk';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockWallet } from '../mocks/mockWallet';
import { MockPara } from '../mocks/mockCorePara';
import { API_KEY, TEST_WALLET } from '../constants';

const queryClient = new QueryClient();

const ConnectMockWallet = () => {
  const { wallets, chainId } = useContext(EvmExternalWalletContext);

  expect(wallets.length).toBe(2);

  const mockWallet = wallets[0];

  expect(mockWallet.id).toBe('mock');
  expect(wallets[1].id).toBe('para');

  useEffect(() => {
    const connect = async () => {
      const resp = await mockWallet.connect();
      expect(resp.address.toLowerCase()).toBe(TEST_WALLET.address.toLowerCase());
    };
    connect();
  }, []);

  useEffect(() => {
    if (chainId) {
      expect(chainId).toBe(sepolia.id);
    }
  }, [chainId]);

  return null;
};

describe('<ParaEvmProvider />', () => {
  it('connects to mock wallet', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ParaEvmProvider
          config={{
            wallets: [mockWallet],
            chains: [sepolia],
          }}
          internalConfig={{
            onSwitchWallet: () => {},
            para: new MockPara(Environment.DEV, API_KEY),
            walletsWithFullAuth: [],
            connectedWallet: undefined,
          }}
        >
          <ConnectMockWallet />
        </ParaEvmProvider>
      </QueryClientProvider>,
    );
  });
});
