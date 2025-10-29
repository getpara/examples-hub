import { describe, vi, afterEach, it, expect, beforeEach } from 'vitest';
import { MockPara } from '../../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../../constants';
import { useAddAuthMethod } from '../../../../src/provider/hooks/mutations';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let queryClient: QueryClient;
let para: MockPara;

vi.mock('../../../../src/provider/hooks/utils/useClient', () => ({ useClient: () => para }));

const { action, openPopupMock, getPortalBaseURLMock } = vi.hoisted(() => {
  return {
    action: vi.fn(),
    openPopupMock: vi.fn(),
    getPortalBaseURLMock: vi.fn(),
  };
});

vi.mock('../../../../src/provider/actions', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    addCredential: action,
  };
});

vi.mock('../../../../src/modal/index.js', () => ({
  openPopup: openPopupMock,
}));

vi.mock('@getpara/web-sdk', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    getPortalBaseURL: getPortalBaseURLMock,
  };
});

describe('useAddAuthMethod', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    para = new MockPara(Environment.DEV, API_KEY);
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('invokes addAuthMethod with default parameters', async () => {
    action.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddAuthMethod(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    expect(result.current.addAuthMethod).toBeDefined();
    expect(result.current.addAuthMethodAsync).toBeDefined();

    await act(async () => {
      await result.current.addAuthMethodAsync();
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(para, {});
    expect(openPopupMock).not.toHaveBeenCalled();
  });

  it('invokes addAuthMethod with custom parameters', async () => {
    action.mockResolvedValue(undefined);
    const customParams = { authMethod: 'PASSKEY' as const };

    const { result } = renderHook(() => useAddAuthMethod(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    await act(async () => {
      await result.current.addAuthMethodAsync(customParams);
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(para, customParams);
  });

  it('does not open popup when openPopup is false', async () => {
    action.mockResolvedValue('https://example.com/auth');

    const { result } = renderHook(() => useAddAuthMethod({ openPopup: false }), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    await act(async () => {
      await result.current.addAuthMethodAsync();
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(openPopupMock).not.toHaveBeenCalled();
  });

  it('does not open popup when result is falsy', async () => {
    action.mockResolvedValue(null);

    const { result } = renderHook(() => useAddAuthMethod({ openPopup: true }), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    await act(async () => {
      await result.current.addAuthMethodAsync();
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(openPopupMock).not.toHaveBeenCalled();
  });

  it('opens popup when result is truthy and openPopup is true', async () => {
    const testUrl = 'https://example.com/auth';
    action.mockResolvedValue(testUrl);

    const { result } = renderHook(() => useAddAuthMethod({ openPopup: true }), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    await act(async () => {
      await result.current.addAuthMethodAsync();
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(openPopupMock).toHaveBeenCalledWith({
      url: testUrl,
      target: 'ParaAddAuthCredential',
      type: 'ADD_CREDENTIAL',
    });
  });
});
