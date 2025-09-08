import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara } from '../../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../../constants';
import { useProfileBalance } from '../../../../src/provider/hooks/queries';
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
    getProfileBalance: action,
  };
});

describe('useProfileBalance', async () => {
  it('invokes getProfileBalance', async () => {
    para = new MockPara(Environment.DEV, API_KEY);

    const hook = renderHook(() => useProfileBalance(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    expect(hook.result.current).toBeDefined();
    expect(typeof hook.result.current).toBe('object');
    expect(hook.result.current).toHaveProperty('data');
    expect(hook.result.current).toHaveProperty('isLoading');
    expect(hook.result.current).toHaveProperty('isSuccess');
    expect(hook.result.current).toHaveProperty('isError');
  });

  it('accepts refetchTrigger option', async () => {
    para = new MockPara(Environment.DEV, API_KEY);

    const hook = renderHook(() => useProfileBalance({ refetchTrigger: 1 }), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    expect(hook.result.current).toBeDefined();
  });

  it('handles different refetchTrigger types', async () => {
    para = new MockPara(Environment.DEV, API_KEY);

    // Test with number
    let hook = renderHook(() => useProfileBalance({ refetchTrigger: 123 }), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(hook.result.current).toBeDefined();

    // Test with string
    hook = renderHook(() => useProfileBalance({ refetchTrigger: 'test' }), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(hook.result.current).toBeDefined();

    // Test with undefined
    hook = renderHook(() => useProfileBalance({ refetchTrigger: undefined }), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(hook.result.current).toBeDefined();
  });

  it('can be called without options', async () => {
    para = new MockPara(Environment.DEV, API_KEY);

    const hook = renderHook(() => useProfileBalance(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    expect(hook.result.current).toBeDefined();
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
