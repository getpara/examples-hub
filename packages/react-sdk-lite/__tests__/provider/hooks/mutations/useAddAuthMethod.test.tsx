import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara } from '../../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../../constants';
import { useAddAuthMethod } from '../../../../src/provider/hooks/mutations';
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
    addCredential: action,
  };
});

describe('useAddAuthMethod', async () => {
  it('invokes addAuthMethod', async () => {
    para = new MockPara(Environment.DEV, API_KEY);

    const hook = renderHook(() => useAddAuthMethod(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    expect(hook.result.current.addAuthMethod).toBeDefined();
    expect(hook.result.current.addAuthMethodAsync).toBeDefined();

    await hook.result.current.addAuthMethodAsync();

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(para, {});
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
