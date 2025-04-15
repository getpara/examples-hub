import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { AddFunds } from '../../../src/modal/components/AddFunds';
import { defineCustomElements } from '@getpara/react-components';
import { Environment, OnRampProvider } from '@getpara/web-sdk';
import { MockPara } from '../../mocks/mockCorePara';
import { API_KEY } from '../../constants';
import { OnRampStep } from '../../../src/modal/stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

vi.mock('../../../src/provider/stores/useStore.js', () => ({
  useStore: getter =>
    getter({
      client: new MockPara(Environment.DEV, API_KEY),
    }),
}));

vi.mock('../../../src/provider/hooks/queries/useWallet.js', () => ({
  useWallet: () => ({
    data: {
      type: 'EVM',
      address: '0x1234567890123456789012345678901234567890',
    },
  }),
}));

const { assetInfo } = vi.hoisted(() => ({
  assetInfo: {
    EVM: {
      ETHEREUM: {
        ETHEREUM: {
          MOONPAY: ['ETH', { BUY: true, SELL: true }],
          STRIPE: ['eth', { BUY: true }],
          RAMP: ['ETH_ETH', { BUY: true, SELL: true }],
        },
        TETHER: {
          MOONPAY: ['USDT', { BUY: true, SELL: true }],
          RAMP: ['ETH_USDT', { BUY: true, SELL: true }],
        },
        USDC: {
          MOONPAY: ['USDC', { BUY: true, SELL: true }],
          STRIPE: ['usdc', { BUY: true }],
          RAMP: ['ETH_USDC', { BUY: true, SELL: true }],
        },
      },
    },
    SOLANA: {
      SOLANA: {
        SOLANA: {
          MOONPAY: ['SOL', { BUY: true }],
          STRIPE: ['sol', { BUY: true }],
          RAMP: ['SOLANA_SOL', { BUY: true }],
        },
        USDC: {
          MOONPAY: ['USDC_SOL', { BUY: true }],
          STRIPE: ['usdc', { BUY: true }],
          RAMP: ['SOLANA_USDC', { BUY: true }],
        },
        TETHER: {
          MOONPAY: ['USDT_SOL', { BUY: true }],
          RAMP: ['SOLANA_USDT', { BUY: true }],
        },
      },
    },
    COSMOS: {
      COSMOS: {
        ATOM: {
          MOONPAY: ['ATOM', { BUY: true }],
          RAMP: ['COSMOS_ATOM', { BUY: true }],
        },
      },
      NOBLE: {
        USDC: {
          MOONPAY: ['USDC_NOBLE', { BUY: true }],
        },
      },
    },
  },
}));

async function setup() {
  defineCustomElements(window);

  const renderer = render(
    <QueryClientProvider client={queryClient}>
      <AddFunds data-testId="add-funds" />
    </QueryClientProvider>,
  );

  return renderer;
}
describe('AddFunds', () => {
  it('renders', async () => {
    vi.mock('../../../src/modal/stores/modal/useModalStore.js', async importOriginal => ({
      ...((await importOriginal()) as any),
      useModalStore: vi.fn(getter => {
        return getter({
          popupWindow: null,
          supportedAuthMethods: new Set(),
          passwordUrlForLogin: '',
          webAuthURLForLogin: '',
          authInfo: {
            auth: null,
            displayName: null,
            pfpUrl: null,
          },
          setAuthInfo: vi.fn(),
          setFlow: vi.fn(),
          setStep: vi.fn(),
          setPopupWindow: vi.fn(),
          biometricLocationHints: [],
          setWebAuthURLForLogin: vi.fn(),
          setPasswordUrlForLogin: vi.fn(),
          setSupportedAuthMethods: vi.fn(),
          setBiometricLocationHints: vi.fn(),
          onRampStep: OnRampStep.SETTINGS,
          onRampConfig: {
            isBuyEnabled: true,
            isReceiveEnabled: true,
            isWithdrawEnabled: true,
            assetInfo,
            providers: [OnRampProvider.STRIPE, OnRampProvider.MOONPAY],
            defaultBuyAmount: ['12.34', 'USD'],
          },
          setOnRampStep: vi.fn(),
          setOnRampPurchase: vi.fn(),
        });
      }),
    }));
    const renderer = await setup();

    expect(renderer.getAllByText('ETH')).toHaveLength(1);
    expect(renderer.getAllByText('USDC')).toHaveLength(1);
    expect(renderer.getAllByText('USDT')).toHaveLength(1);

    await renderer.getByText('ETH').click();

    waitFor(
      () => {
        expect(renderer.getAllByPlaceholderText('Choose network')).toHaveLength(1);
        expect(renderer.getAllByPlaceholderText('Choose asset')).toHaveLength(1);
      },
      { timeout: 10000 },
    );
  });
});
