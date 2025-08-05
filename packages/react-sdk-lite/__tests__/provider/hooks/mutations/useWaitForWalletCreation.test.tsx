import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara } from '../../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../../constants';
import { useWaitForWalletCreation } from '../../../../src/provider/hooks';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

let para: MockPara;

vi.mock('../../../../src/provider/hooks/utils/useClient', () => ({ useClient: () => para }));

const { action } = vi.hoisted(() => {
  return { action: vi.fn() };
});

vi.mock('../../../../src/provider/actions', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    waitForWalletCreation: action,
  };
});

describe('useWaitForWalletCreation', async () => {
  it('invokes waitForWalletCreation', async () => {
    para = new MockPara(Environment.DEV, API_KEY);

    const hook = renderHook(() => useWaitForWalletCreation(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    expect(hook.result.current.waitForWalletCreationAsync).toBeDefined();
    expect(hook.result.current.waitForWalletCreationAsync).toBeDefined();

    await hook.result.current.waitForWalletCreationAsync();

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(para, {});
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
