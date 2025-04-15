import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara } from '../../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../../constants';
import { useWaitForPasskeyAndCreateWallet } from '../../../../src/provider/hooks/mutations/useWaitForPasskeyAndCreateWallet';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

let para: MockPara;

vi.mock('../../../../src/provider/hooks/utils/useClient', () => ({ useClient: () => para }));

const { action } = vi.hoisted(() => {
  return { action: vi.fn() };
});

vi.mock('../../../../src/provider/actions/waitForPasskeyAndCreateWallet', () => ({
  waitForPasskeyAndCreateWallet: action,
}));

describe('useWaitForPasskeyAndCreateWallet', async () => {
  it('invokes waitForPasskeyAndCreateWallet', async () => {
    para = new MockPara(Environment.DEV, API_KEY);

    const hook = renderHook(() => useWaitForPasskeyAndCreateWallet(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    expect(hook.result.current.waitForPasskeyAndCreateWallet).toBeDefined();
    expect(hook.result.current.waitForPasskeyAndCreateWalletAsync).toBeDefined();

    await hook.result.current.waitForPasskeyAndCreateWalletAsync();

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(para);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
