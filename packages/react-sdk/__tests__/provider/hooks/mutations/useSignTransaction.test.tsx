import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara } from '../../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../../constants';
import { useSignTransaction } from '../../../../src/provider/hooks/mutations/useSignTransaction';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

let para: MockPara;

vi.mock('../../../../src/provider/hooks/utils/useClient', () => ({ useClient: () => para }));

const { action } = vi.hoisted(() => {
  return { action: vi.fn() };
});

vi.mock('../../../../src/provider/actions/signTransaction', () => ({
  signTransaction: action,
}));

describe('useSignTransaction', async () => {
  it('invokes signTransaction', async () => {
    para = new MockPara(Environment.DEV, API_KEY);
    const args = { walletId: 'walletId', chainId: '1', rlpEncodedTxBase64: 'Hello World' };

    const hook = renderHook(() => useSignTransaction(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    expect(hook.result.current.signTransaction).toBeDefined();
    expect(hook.result.current.signTransactionAsync).toBeDefined();

    await hook.result.current.signTransactionAsync(args);

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(para, args);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
