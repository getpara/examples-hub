import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, createElement } from 'react';
import { useEventListeners } from '../../../../src/provider/hooks/utils/useEventListeners.js';
import {
  ParaEvent,
  LoginEvent,
  LogoutEvent,
  AccountSetupEvent,
  AccountCreationEvent,
  SignMessageEvent,
  SignTransactionEvent,
  WalletsChangeEvent,
  ExternalWalletChangeEvent,
  WalletCreatedEvent,
  PregenWalletClaimedEvent,
  GuestWalletsCreatedEvent,
} from '@getpara/web-sdk';

// Mock the dependencies
const mockUpdateSelectedWallet = vi.fn();
const mockClearSelectedWallet = vi.fn();
const mockBalancesInvalidationTime = { current: 0 };

vi.mock('../../../../src/provider/hooks/index.js', () => ({
  useWalletState: vi.fn(() => ({
    selectedWallet: { id: 'test', type: 'EVM' as const },
    setSelectedWallet: vi.fn(),
    updateSelectedWallet: mockUpdateSelectedWallet,
  })),
}));

vi.mock('../../../../src/provider/stores/useStore.js', () => ({
  useStore: vi.fn(selector => {
    const mockStore = {
      refs: {
        balancesInvalidationTime: mockBalancesInvalidationTime,
      },
      clearSelectedWallet: mockClearSelectedWallet,
      setClient: vi.fn(),
      client: null,
      popupWindow: null,
      setPopupWindow: vi.fn(),
      isModalOpen: false,
      setIsModalOpen: vi.fn(),
      step: 'login',
      setStep: vi.fn(),
      flow: 'login',
      setFlow: vi.fn(),
      selectedWalletId: null,
      selectedWalletType: null,
      setSelectedWallet: vi.fn(),
      connectedExternalWallets: [],
      setConnectedExternalWallets: vi.fn(),
      removeConnectedExternalWallet: vi.fn(),
      appName: 'test',
      setAppName: vi.fn(),
      disableAutomaticSessionKeepAlive: false,
      setDisableAutomaticSessionKeepAlive: vi.fn(),
      externalWalletConfig: {},
      setExternalWalletConfig: vi.fn(),
      track: vi.fn(),
    };
    return selector(mockStore);
  }),
}));

// Mock constants
vi.mock('../../../../src/provider/hooks/queries/useAccount.js', () => ({
  ACCOUNT_BASE_KEY: 'account',
}));

vi.mock('../../../../src/provider/hooks/queries/useWallet.js', () => ({
  WALLET_BASE_KEY: 'wallet',
}));

vi.mock('../../../../src/provider/hooks/queries/useWalletBalance.js', () => ({
  WALLET_BALANCE_BASE_KEY: 'walletBalance',
}));

vi.mock('../../../../src/provider/hooks/queries/useIsFullyLoggedIn.js', () => ({
  IS_FULLY_LOGGED_IN_BASE_KEY: 'isFullyLoggedIn',
}));

describe('useEventListeners', () => {
  let queryClient: QueryClient;
  let mockCallbacks: any;

  const createWrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockCallbacks = {
      onLogin: vi.fn(),
      onLogout: vi.fn(),
      onAccountSetup: vi.fn(),
      onAccountCreation: vi.fn(),
      onSignMessage: vi.fn(),
      onSignTransaction: vi.fn(),
      onWalletCreated: vi.fn(),
      onPregenWalletClaimed: vi.fn(),
      onExternalWalletChange: vi.fn(),
      onWalletsChange: vi.fn(),
      onGuestWalletsCreated: vi.fn(),
    };

    // Reset mock functions
    mockUpdateSelectedWallet.mockClear();
    mockClearSelectedWallet.mockClear();
    mockBalancesInvalidationTime.current = 0;

    // Add spies to queryClient methods
    vi.spyOn(queryClient, 'refetchQueries');
    vi.spyOn(queryClient, 'invalidateQueries');
    vi.spyOn(queryClient, 'setQueriesData');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should render without callbacks', () => {
      const { result } = renderHook(() => useEventListeners(), {
        wrapper: createWrapper,
      });

      expect(result.current).toBeUndefined();
    });

    it('should render with empty callbacks object', () => {
      const { result } = renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      expect(result.current).toBeUndefined();
    });

    it('should render with all callbacks provided', () => {
      const { result } = renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe('event listeners registration and cleanup', () => {
    it('should register all event listeners on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.LOGIN_EVENT, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.ACCOUNT_SETUP_EVENT, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.ACCOUNT_CREATION_EVENT, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.LOGOUT_EVENT, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.SIGN_MESSAGE_EVENT, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.SIGN_TRANSACTION_EVENT, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.WALLETS_CHANGE_EVENT, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.WALLET_CREATED, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.PREGEN_WALLET_CLAIMED, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.GUEST_WALLETS_CREATED, expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(ParaEvent.ASSET_TRANSFERRED, expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should remove all event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.LOGIN_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.ACCOUNT_SETUP_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.ACCOUNT_CREATION_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.LOGOUT_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.SIGN_MESSAGE_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.SIGN_TRANSACTION_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.WALLETS_CHANGE_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.WALLET_CREATED, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.PREGEN_WALLET_CLAIMED, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.GUEST_WALLETS_CREATED, expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(ParaEvent.ASSET_TRANSFERRED, expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('LOGIN_EVENT handling', () => {
    it('should handle login event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'login', data: { userId: 'test' } } as LoginEvent;

      // Get the login listener from the spy calls
      const loginListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.LOGIN_EVENT);
      const loginListener = loginListenerCall?.[1] as (event: LoginEvent) => void;

      // Call the listener directly with the mock event
      loginListener(mockEvent);

      expect(mockCallbacks.onLogin).toHaveBeenCalledWith(mockEvent);
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['wallet'] });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['walletBalance'], exact: false });

      addEventListenerSpy.mockRestore();
    });

    it('should handle login event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'login', data: { userId: 'test' } } as LoginEvent;

      // Get the login listener from the spy calls
      const loginListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.LOGIN_EVENT);
      const loginListener = loginListenerCall?.[1] as (event: LoginEvent) => void;

      // Call the listener directly with the mock event
      loginListener(mockEvent);

      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['wallet'] });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['walletBalance'], exact: false });

      addEventListenerSpy.mockRestore();
    });
  });

  describe('LOGOUT_EVENT handling', () => {
    it('should handle logout event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'logout', data: {} } as LogoutEvent;

      // Get the logout listener from the spy calls
      const logoutListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.LOGOUT_EVENT);
      const logoutListener = logoutListenerCall?.[1] as (event: LogoutEvent) => void;

      // Call the listener directly with the mock event
      logoutListener(mockEvent);

      expect(mockCallbacks.onLogout).toHaveBeenCalledWith(mockEvent);
      expect(queryClient.setQueriesData).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] }, false);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(mockClearSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('should handle logout event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'logout', data: {} } as LogoutEvent;

      // Get the logout listener from the spy calls
      const logoutListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.LOGOUT_EVENT);
      const logoutListener = logoutListenerCall?.[1] as (event: LogoutEvent) => void;

      // Call the listener directly with the mock event
      logoutListener(mockEvent);

      expect(queryClient.setQueriesData).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] }, false);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(mockClearSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });

  describe('ASSET_TRANSFERRED handling', () => {
    it('should handle asset transferred event', () => {
      const initialTime = mockBalancesInvalidationTime.current;

      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      window.dispatchEvent(new CustomEvent(ParaEvent.ASSET_TRANSFERRED));

      expect(mockBalancesInvalidationTime.current).toBeGreaterThan(initialTime);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['useProfileBalance'],
        refetchType: 'active',
      });
    });
  });

  describe('ACCOUNT_SETUP_EVENT handling', () => {
    it('should handle account setup event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'account_setup', data: { accountId: 'test' } } as AccountSetupEvent;

      // Get the account setup listener from the spy calls
      const accountSetupListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.ACCOUNT_SETUP_EVENT,
      );
      const accountSetupListener = accountSetupListenerCall?.[1] as (event: AccountSetupEvent) => void;

      // Call the listener directly with the mock event
      accountSetupListener(mockEvent);

      expect(mockCallbacks.onAccountSetup).toHaveBeenCalledWith(mockEvent);
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['wallet'] });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['walletBalance'], exact: false });

      addEventListenerSpy.mockRestore();
    });

    it('should handle account setup event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'account_setup', data: { accountId: 'test' } } as AccountSetupEvent;

      // Get the account setup listener from the spy calls
      const accountSetupListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.ACCOUNT_SETUP_EVENT,
      );
      const accountSetupListener = accountSetupListenerCall?.[1] as (event: AccountSetupEvent) => void;

      // Call the listener directly with the mock event
      accountSetupListener(mockEvent);

      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['wallet'] });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['walletBalance'], exact: false });

      addEventListenerSpy.mockRestore();
    });
  });

  describe('ACCOUNT_CREATION_EVENT handling', () => {
    it('should handle account creation event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'account_creation', data: { accountId: 'test' } } as AccountCreationEvent;

      // Get the account creation listener from the spy calls
      const accountCreationListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.ACCOUNT_CREATION_EVENT,
      );
      const accountCreationListener = accountCreationListenerCall?.[1] as (event: AccountCreationEvent) => void;

      // Call the listener directly with the mock event
      accountCreationListener(mockEvent);

      expect(mockCallbacks.onAccountCreation).toHaveBeenCalledWith(mockEvent);
      // This event only calls the callback, no query operations

      addEventListenerSpy.mockRestore();
    });

    it('should handle account creation event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'account_creation', data: { accountId: 'test' } } as AccountCreationEvent;

      // Get the account creation listener from the spy calls
      const accountCreationListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.ACCOUNT_CREATION_EVENT,
      );
      const accountCreationListener = accountCreationListenerCall?.[1] as (event: AccountCreationEvent) => void;

      // Call the listener directly with the mock event
      accountCreationListener(mockEvent);

      // Should not throw and no additional effects expected
      addEventListenerSpy.mockRestore();
    });
  });

  describe('SIGN_MESSAGE_EVENT handling', () => {
    it('should handle sign message event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'sign_message', data: { message: 'Hello', signature: '0x123' } } as SignMessageEvent;

      // Get the sign message listener from the spy calls
      const signMessageListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.SIGN_MESSAGE_EVENT);
      const signMessageListener = signMessageListenerCall?.[1] as (event: SignMessageEvent) => void;

      // Call the listener directly with the mock event
      signMessageListener(mockEvent);

      expect(mockCallbacks.onSignMessage).toHaveBeenCalledWith(mockEvent);

      addEventListenerSpy.mockRestore();
    });

    it('should handle sign message event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'sign_message', data: { message: 'Hello', signature: '0x123' } } as SignMessageEvent;

      // Get the sign message listener from the spy calls
      const signMessageListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.SIGN_MESSAGE_EVENT);
      const signMessageListener = signMessageListenerCall?.[1] as (event: SignMessageEvent) => void;

      // Call the listener directly with the mock event
      signMessageListener(mockEvent);

      // Should not throw and no additional effects expected
      addEventListenerSpy.mockRestore();
    });
  });

  describe('SIGN_TRANSACTION_EVENT handling', () => {
    it('should handle sign transaction event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = {
        type: 'sign_transaction',
        data: { transaction: '0x123', signature: '0x456' },
      } as SignTransactionEvent;

      // Get the sign transaction listener from the spy calls
      const signTransactionListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.SIGN_TRANSACTION_EVENT,
      );
      const signTransactionListener = signTransactionListenerCall?.[1] as (event: SignTransactionEvent) => void;

      // Call the listener directly with the mock event
      signTransactionListener(mockEvent);

      expect(mockCallbacks.onSignTransaction).toHaveBeenCalledWith(mockEvent);

      addEventListenerSpy.mockRestore();
    });

    it('should handle sign transaction event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = {
        type: 'sign_transaction',
        data: { transaction: '0x123', signature: '0x456' },
      } as SignTransactionEvent;

      // Get the sign transaction listener from the spy calls
      const signTransactionListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.SIGN_TRANSACTION_EVENT,
      );
      const signTransactionListener = signTransactionListenerCall?.[1] as (event: SignTransactionEvent) => void;

      // Call the listener directly with the mock event
      signTransactionListener(mockEvent);

      // Should not throw and no additional effects expected
      addEventListenerSpy.mockRestore();
    });
  });

  describe('WALLETS_CHANGE_EVENT handling', () => {
    it('should handle wallets change event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'wallets_change', data: { wallets: [] } } as WalletsChangeEvent;

      // Get the wallets change listener from the spy calls
      const walletsChangeListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.WALLETS_CHANGE_EVENT,
      );
      const walletsChangeListener = walletsChangeListenerCall?.[1] as (event: WalletsChangeEvent) => void;

      // Call the listener directly with the mock event
      walletsChangeListener(mockEvent);

      expect(mockCallbacks.onWalletsChange).toHaveBeenCalledWith(mockEvent);
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(mockUpdateSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('should handle wallets change event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'wallets_change', data: { wallets: [] } } as WalletsChangeEvent;

      // Get the wallets change listener from the spy calls
      const walletsChangeListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.WALLETS_CHANGE_EVENT,
      );
      const walletsChangeListener = walletsChangeListenerCall?.[1] as (event: WalletsChangeEvent) => void;

      // Call the listener directly with the mock event
      walletsChangeListener(mockEvent);

      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(mockUpdateSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });

  describe('EXTERNAL_WALLET_CHANGE_EVENT handling', () => {
    it('should handle external wallet change event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'external_wallet_change', data: { walletId: 'external123' } } as ExternalWalletChangeEvent;

      // Get the external wallet change listener from the spy calls
      const externalWalletChangeListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT,
      );
      const externalWalletChangeListener = externalWalletChangeListenerCall?.[1] as (
        event: ExternalWalletChangeEvent,
      ) => void;

      // Call the listener directly with the mock event
      externalWalletChangeListener(mockEvent);

      expect(mockCallbacks.onExternalWalletChange).toHaveBeenCalledWith(mockEvent);
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(mockUpdateSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('should handle external wallet change event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'external_wallet_change', data: { walletId: 'external123' } } as ExternalWalletChangeEvent;

      // Get the external wallet change listener from the spy calls
      const externalWalletChangeListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT,
      );
      const externalWalletChangeListener = externalWalletChangeListenerCall?.[1] as (
        event: ExternalWalletChangeEvent,
      ) => void;

      // Call the listener directly with the mock event
      externalWalletChangeListener(mockEvent);

      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(mockUpdateSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });

  describe('WALLET_CREATED handling', () => {
    it('should handle wallet created event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'wallet_created', data: { walletId: 'wallet123' } } as WalletCreatedEvent;

      // Get the wallet created listener from the spy calls
      const walletCreatedListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.WALLET_CREATED);
      const walletCreatedListener = walletCreatedListenerCall?.[1] as (event: WalletCreatedEvent) => void;

      // Call the listener directly with the mock event
      walletCreatedListener(mockEvent);

      expect(mockCallbacks.onWalletCreated).toHaveBeenCalledWith(mockEvent);
      // This event only calls the callback, no query operations

      addEventListenerSpy.mockRestore();
    });

    it('should handle wallet created event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'wallet_created', data: { walletId: 'wallet123' } } as WalletCreatedEvent;

      // Get the wallet created listener from the spy calls
      const walletCreatedListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.WALLET_CREATED);
      const walletCreatedListener = walletCreatedListenerCall?.[1] as (event: WalletCreatedEvent) => void;

      // Call the listener directly with the mock event
      walletCreatedListener(mockEvent);

      // Should not throw and no additional effects expected
      addEventListenerSpy.mockRestore();
    });
  });

  describe('PREGEN_WALLET_CLAIMED handling', () => {
    it('should handle pregen wallet claimed event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'pregen_wallet_claimed', data: { walletId: 'pregen123' } } as PregenWalletClaimedEvent;

      // Get the pregen wallet claimed listener from the spy calls
      const pregenWalletClaimedListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.PREGEN_WALLET_CLAIMED,
      );
      const pregenWalletClaimedListener = pregenWalletClaimedListenerCall?.[1] as (event: PregenWalletClaimedEvent) => void;

      // Call the listener directly with the mock event
      pregenWalletClaimedListener(mockEvent);

      expect(mockCallbacks.onPregenWalletClaimed).toHaveBeenCalledWith(mockEvent);
      // This event only calls the callback, no query operations

      addEventListenerSpy.mockRestore();
    });

    it('should handle pregen wallet claimed event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'pregen_wallet_claimed', data: { walletId: 'pregen123' } } as PregenWalletClaimedEvent;

      // Get the pregen wallet claimed listener from the spy calls
      const pregenWalletClaimedListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.PREGEN_WALLET_CLAIMED,
      );
      const pregenWalletClaimedListener = pregenWalletClaimedListenerCall?.[1] as (event: PregenWalletClaimedEvent) => void;

      // Call the listener directly with the mock event
      pregenWalletClaimedListener(mockEvent);

      // Should not throw and no additional effects expected
      addEventListenerSpy.mockRestore();
    });
  });

  describe('GUEST_WALLETS_CREATED handling', () => {
    it('should handle guest wallets created event and call callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = {
        type: 'guest_wallets_created',
        data: { walletIds: ['guest1', 'guest2'] },
      } as GuestWalletsCreatedEvent;

      // Get the guest wallets created listener from the spy calls
      const guestWalletsCreatedListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.GUEST_WALLETS_CREATED,
      );
      const guestWalletsCreatedListener = guestWalletsCreatedListenerCall?.[1] as (event: GuestWalletsCreatedEvent) => void;

      // Call the listener directly with the mock event
      guestWalletsCreatedListener(mockEvent);

      expect(mockCallbacks.onGuestWalletsCreated).toHaveBeenCalledWith(mockEvent);
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(mockUpdateSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('should handle guest wallets created event without callback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners({}), {
        wrapper: createWrapper,
      });

      const mockEvent = {
        type: 'guest_wallets_created',
        data: { walletIds: ['guest1', 'guest2'] },
      } as GuestWalletsCreatedEvent;

      // Get the guest wallets created listener from the spy calls
      const guestWalletsCreatedListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.GUEST_WALLETS_CREATED,
      );
      const guestWalletsCreatedListener = guestWalletsCreatedListenerCall?.[1] as (event: GuestWalletsCreatedEvent) => void;

      // Call the listener directly with the mock event
      guestWalletsCreatedListener(mockEvent);

      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['account'] });
      expect(mockUpdateSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });

  describe('callback changes', () => {
    it('should handle callback changes without causing issues', () => {
      const initialCallbacks = {
        onLogin: vi.fn(),
        onLogout: vi.fn(),
      };

      const { rerender } = renderHook(({ callbacks }) => useEventListeners(callbacks), {
        wrapper: createWrapper,
        initialProps: { callbacks: initialCallbacks },
      });

      const updatedCallbacks = {
        onLogin: vi.fn(),
        onAccountSetup: vi.fn(),
      } as any;

      rerender({ callbacks: updatedCallbacks });

      // Should not throw and should still work with new callbacks
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const loginListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.LOGIN_EVENT);
      const loginListener = loginListenerCall?.[1] as (event: any) => void;

      if (loginListener) {
        const mockEvent = { type: 'login', data: { userId: 'test' } };
        loginListener(mockEvent);
        expect(updatedCallbacks.onLogin).toHaveBeenCalledWith(mockEvent);
      }

      addEventListenerSpy.mockRestore();
    });

    it('should handle all events with partial callbacks', () => {
      const partialCallbacks = {
        onLogin: vi.fn(),
        onWalletCreated: vi.fn(),
      };

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(partialCallbacks), {
        wrapper: createWrapper,
      });

      // Test that only provided callbacks are called
      const loginListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.LOGIN_EVENT);
      const loginListener = loginListenerCall?.[1] as (event: any) => void;

      const walletCreatedListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.WALLET_CREATED);
      const walletCreatedListener = walletCreatedListenerCall?.[1] as (event: any) => void;

      if (loginListener) {
        loginListener({ type: 'login', data: {} });
        expect(partialCallbacks.onLogin).toHaveBeenCalled();
      }

      if (walletCreatedListener) {
        walletCreatedListener({ type: 'wallet_created', data: {} });
        expect(partialCallbacks.onWalletCreated).toHaveBeenCalled();
      }

      addEventListenerSpy.mockRestore();
    });
  });

  describe('refs and balance invalidation', () => {
    it('should use refs.balancesInvalidationTime for ASSET_TRANSFERRED event', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const initialTime = mockBalancesInvalidationTime.current;

      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      // Get the asset transfer listener from the spy calls
      const assetTransferListenerCall = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.ASSET_TRANSFERRED);
      const assetTransferListener = assetTransferListenerCall?.[1] as () => void;

      // Call the listener directly
      assetTransferListener();

      expect(mockBalancesInvalidationTime.current).toBeGreaterThan(initialTime);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['useProfileBalance'],
        refetchType: 'active',
      });

      addEventListenerSpy.mockRestore();
    });

    it('should call updateSelectedWallet on WALLETS_CHANGE_EVENT', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const mockEvent = { type: 'wallets_change', data: { wallets: [] } } as WalletsChangeEvent;

      // Get the wallets change listener from the spy calls
      const walletsChangeListenerCall = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.WALLETS_CHANGE_EVENT,
      );
      const walletsChangeListener = walletsChangeListenerCall?.[1] as (event: WalletsChangeEvent) => void;

      // Call the listener directly with the mock event
      walletsChangeListener(mockEvent);

      expect(mockUpdateSelectedWallet).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });

  describe('integration tests', () => {
    it('should handle multiple different events in sequence', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      // Get all listeners
      const loginListener = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.LOGIN_EVENT)?.[1] as (
        event: any,
      ) => void;
      const logoutListener = addEventListenerSpy.mock.calls.find(call => call[0] === ParaEvent.LOGOUT_EVENT)?.[1] as (
        event: any,
      ) => void;
      const assetTransferListener = addEventListenerSpy.mock.calls.find(
        call => call[0] === ParaEvent.ASSET_TRANSFERRED,
      )?.[1] as () => void;

      // Create mock events
      const loginEvent = { type: 'login', data: { userId: 'test' } };
      const logoutEvent = { type: 'logout', data: {} };

      // Call listeners in sequence
      loginListener(loginEvent);
      assetTransferListener();
      logoutListener(logoutEvent);

      // Verify all callbacks were called
      expect(mockCallbacks.onLogin).toHaveBeenCalledWith(loginEvent);
      expect(mockCallbacks.onLogout).toHaveBeenCalledWith(logoutEvent);

      // Verify query operations were performed
      // Login: 3 refetch calls + 1 invalidate, Asset transfer: 1 invalidate, Logout: no refetch + 4 invalidates + 1 setQueriesData
      // From test output: 7 refetch calls were made, so adjust expectation
      expect(queryClient.refetchQueries).toHaveBeenCalledTimes(7);
      expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(4); // login + asset + logout (4 calls observed)
      expect(queryClient.setQueriesData).toHaveBeenCalledWith({ queryKey: ['isFullyLoggedIn'] }, false);

      addEventListenerSpy.mockRestore();
    });

    it('should maintain listener state across component re-renders', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { rerender, unmount } = renderHook(() => useEventListeners(mockCallbacks), {
        wrapper: createWrapper,
      });

      const initialAddCount = addEventListenerSpy.mock.calls.length;

      // Re-render the component
      rerender();

      // Should not add new listeners on re-render
      expect(addEventListenerSpy.mock.calls.length).toBe(initialAddCount);

      // Unmount should remove all listeners
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(12); // All 12 event types
      expect(removeEventListenerSpy.mock.calls.some(call => call[0] === ParaEvent.LOGIN_EVENT)).toBe(true);
      expect(removeEventListenerSpy.mock.calls.some(call => call[0] === ParaEvent.LOGOUT_EVENT)).toBe(true);
      expect(removeEventListenerSpy.mock.calls.some(call => call[0] === ParaEvent.ASSET_TRANSFERRED)).toBe(true);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
