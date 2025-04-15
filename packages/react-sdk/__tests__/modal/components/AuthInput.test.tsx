import { afterAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthInput } from '../../../src/modal/components/AuthInput/AuthInput.js';
import { defineCustomElements } from '@getpara/react-components';
import { mockModalStore } from '../../utils.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MockPara } from '../../mocks/mockCorePara.js';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants.js';
const queryClient = new QueryClient();

async function setup() {
  defineCustomElements(window);

  const renderer = render(
    <QueryClientProvider client={queryClient}>
      <AuthInput />
    </QueryClientProvider>,
  );
  const host = screen.getByTestId('auth-input') as HTMLInputElement;

  await waitFor(
    () => {
      expect(host.classList).toContain('hydrated');
    },
    { timeout: 20000 },
  );

  const shadowRoot = host.shadowRoot;

  return {
    input: () => host.shadowRoot.querySelector('input') as HTMLInputElement,
    countryCodeSelect: () =>
      renderer.getByTestId('country-code-select').shadowRoot.querySelector('input') as HTMLInputElement,
    shadowRoot,
    renderer,
  };
}

vi.mock('../../../src/provider/stores/useStore.js', () => ({
  useStore: getter =>
    getter({
      client: new MockPara(Environment.DEV, API_KEY),
    }),
}));

describe('ParaModal', () => {
  afterAll(() => {
    vi.clearAllMocks();
  });

  it('renders input', async () => {
    vi.spyOn(MockPara.prototype, 'authInfo', 'get').mockReturnValue(undefined);

    mockModalStore();

    const { input, countryCodeSelect } = await setup();

    expect(input).toBeDefined();
    expect(input().value).toEqual('');
    expect(screen.getByLabelText('phone')).toBeDefined();
    expect(screen.getByLabelText('email')).toBeDefined();

    await userEvent.type(input(), '555');

    expect(input().value).toEqual('(555) ___-____');
    expect(screen.queryByLabelText('phone')).toBeDefined();
    expect(screen.queryByLabelText('email')).toBeNull();

    expect(countryCodeSelect().value).toEqual('US');

    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');

    expect(input().value).toEqual('');

    await userEvent.keyboard('+');
    await userEvent.keyboard('4');
    await userEvent.keyboard('7');
    await userEvent.keyboard('1');

    expect(input().value).toEqual('1__ __ ___');

    expect(countryCodeSelect().value).toEqual('NO');

    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');
    await userEvent.keyboard('{backspace}');

    await userEvent.type(input(), 'abcd');

    expect(input().value).toEqual('abcd');
    expect(screen.queryByLabelText('email')).toBeDefined();
    expect(screen.queryByLabelText('phone')).toBeNull();
  }, 20000);

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
