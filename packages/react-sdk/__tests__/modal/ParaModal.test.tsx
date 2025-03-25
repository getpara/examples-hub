import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Para, { Environment, OAuthMethod, ParaProvider, setIsOpen } from '../../src/index.js';
import { OnRampAssetInfo, OnRampConfig } from '@getpara/user-management-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('ParaModal', () => {
  beforeAll(() => {
    const ResizeObserverMock = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    vi.mock('@getpara/user-management-client', async importOriginal => {
      const actual = await importOriginal();

      return {
        ...(actual as any),
        default: vi.fn().mockImplementation(() => {
          return {
            getPartner: vi.fn(() => ({ data: {} })),
            createUser: vi.fn(() => ({ userId: '123' })),
            touchSession: vi.fn(() => ({})),
            getOnRampConfig: vi.fn<never, Promise<OnRampConfig>>(async () => ({
              isBuyEnabled: false,
              isReceiveEnabled: false,
              isWithdrawEnabled: false,
              assetInfo: {} as OnRampAssetInfo,
              providers: [],
            })),
          };
        }),
      };
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('renders first screen', async () => {
    const para = new Para(Environment.DEV, 'apikey123');
    render(
      <QueryClientProvider client={queryClient}>
        <ParaProvider
          paraClientConfig={para}
          config={{ appName: 'App Name' }}
          paraModalConfig={{
            oAuthMethods: [OAuthMethod.GOOGLE, OAuthMethod.FACEBOOK, OAuthMethod.APPLE],
          }}
        />
      </QueryClientProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getAllByTestId('modal')).toBeDefined();
      },
      { timeout: 2000 },
    );

    setIsOpen(true);

    await waitFor(
      () => {
        expect(screen.getAllByTestId('modal-content')).toBeDefined();
        expect(screen.getAllByTestId('main-auth-step-content')).toBeDefined();
      },
      { timeout: 2000 },
    );
  });

  // TODO: add data-testid as optional field to all components and reimpliment using data-testid selector
  // it('can continue with email', async () => {
  //   const para = new Para(Environment.DEV, 'apikey123');
  //   render(
  //     <ParaModal
  //       isOpen={true}
  //       para={para}
  //       appName="App Name"
  //       oAuthMethods={[OAuthMethod.GOOGLE, OAuthMethod.FACEBOOK, OAuthMethod.APPLE]}
  //       onClose={() => {}}
  //     />,
  //   );

  //   await waitFor(() => {
  //     expect(screen.getByText('Sign Up or Log In')).toBeDefined();
  //   });
  //   const emailInput = screen.getByPlaceholderText('Enter your email');
  //   fireEvent.change(emailInput, { target: { value: 'unit-test@test.usecapsule.com' } });
  //   fireEvent.click(screen.getAllByRole('img', {})[4]);
  //   // fireEvent.click(screen.getByRole('img', {}));

  //   await waitFor(() => {
  //     expect(screen.getByText('Verify Email')).toBeDefined();
  //   });
  //   expect(screen.getByText('Verify Email')).toBeDefined();
  // });
});
