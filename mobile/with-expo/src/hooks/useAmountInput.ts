import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { WalletType } from '@getpara/react-native-wallet';
import {
  validateAmount,
  convertUsdToCrypto,
  convertCryptoToUsd,
} from '@/utils';

interface UseAmountInputProps {
  tokenTicker: string;
  availableBalance: number;
  usdPrice: number | null;
  networkType: WalletType;
  maxAmount?: number;
}

interface AmountState {
  amountCrypto: string;
  amountUsd: string;
  isUsdMode: boolean;
  error: string;
}

type AmountAction =
  | { type: 'SET_CRYPTO_AMOUNT'; payload: string }
  | { type: 'SET_USD_AMOUNT'; payload: string }
  | { type: 'TOGGLE_MODE' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_MAX'; payload: string }
  | {
      type: 'SYNC_USD_TO_CRYPTO';
      payload: { amount: string; usdPrice: number; networkType: WalletType };
    }
  | {
      type: 'SYNC_CRYPTO_TO_USD';
      payload: { amount: string; usdPrice: number };
    };

function amountReducer(state: AmountState, action: AmountAction): AmountState {
  switch (action.type) {
    case 'SET_CRYPTO_AMOUNT':
      return { ...state, amountCrypto: action.payload };

    case 'SET_USD_AMOUNT':
      return { ...state, amountUsd: action.payload };

    case 'TOGGLE_MODE':
      return { ...state, isUsdMode: !state.isUsdMode };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_MAX':
      return { ...state, amountCrypto: action.payload, isUsdMode: false };

    case 'SYNC_USD_TO_CRYPTO': {
      const { amount, usdPrice, networkType } = action.payload;
      const numValue = parseFloat(amount);
      if (!isNaN(numValue) && usdPrice > 0) {
        return {
          ...state,
          amountUsd: amount,
          amountCrypto: convertUsdToCrypto(numValue, usdPrice, networkType),
        };
      }
      return { ...state, amountUsd: amount, amountCrypto: '' };
    }

    case 'SYNC_CRYPTO_TO_USD': {
      const { amount, usdPrice } = action.payload;
      const numValue = parseFloat(amount);
      if (!isNaN(numValue) && usdPrice > 0) {
        return {
          ...state,
          amountCrypto: amount,
          amountUsd: convertCryptoToUsd(numValue, usdPrice),
        };
      }
      return { ...state, amountCrypto: amount, amountUsd: '' };
    }

    default:
      return state;
  }
}

export function useAmountInput({
  tokenTicker,
  availableBalance,
  usdPrice,
  networkType,
  maxAmount,
}: UseAmountInputProps) {
  const [state, dispatch] = useReducer(amountReducer, {
    amountCrypto: '',
    amountUsd: '',
    isUsdMode: false,
    error: '',
  });

  // Validate amount whenever it changes
  useEffect(() => {
    const validationError = validateAmount(
      state.amountCrypto,
      availableBalance,
      tokenTicker,
      networkType
    );
    dispatch({ type: 'SET_ERROR', payload: validationError });
  }, [state.amountCrypto, availableBalance, tokenTicker, networkType]);

  const toggleMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_MODE' });
  }, []);

  const handleUsdChange = useCallback(
    (newUsdValue: string) => {
      if (usdPrice && usdPrice > 0) {
        dispatch({
          type: 'SYNC_USD_TO_CRYPTO',
          payload: { amount: newUsdValue, usdPrice, networkType },
        });
      } else {
        dispatch({ type: 'SET_USD_AMOUNT', payload: newUsdValue });
      }
    },
    [usdPrice, networkType]
  );

  const handleCryptoChange = useCallback(
    (newAmount: string) => {
      if (usdPrice && usdPrice > 0) {
        dispatch({
          type: 'SYNC_CRYPTO_TO_USD',
          payload: { amount: newAmount, usdPrice },
        });
      } else {
        dispatch({ type: 'SET_CRYPTO_AMOUNT', payload: newAmount });
      }
    },
    [usdPrice]
  );

  const setMaxAmount = useCallback(() => {
    const max = maxAmount !== undefined ? maxAmount : availableBalance;
    dispatch({ type: 'SET_MAX', payload: max.toString() });
    // Also sync to USD if price is available
    if (usdPrice && usdPrice > 0) {
      dispatch({
        type: 'SYNC_CRYPTO_TO_USD',
        payload: { amount: max.toString(), usdPrice },
      });
    }
  }, [maxAmount, availableBalance, usdPrice]);

  const conversionDisplay = useMemo(() => {
    if (!usdPrice || usdPrice <= 0 || (!state.amountCrypto && !state.amountUsd))
      return '';

    const value = state.isUsdMode ? state.amountUsd : state.amountCrypto;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';

    if (state.isUsdMode) {
      const cryptoValue = convertUsdToCrypto(numValue, usdPrice, networkType);
      return `≈ ${cryptoValue} ${tokenTicker}`;
    } else {
      const usdAmount = convertCryptoToUsd(numValue, usdPrice);
      return `≈ $${usdAmount}`;
    }
  }, [
    state.amountCrypto,
    state.amountUsd,
    state.isUsdMode,
    usdPrice,
    tokenTicker,
    networkType,
  ]);

  const isValid = useMemo(() => {
    return !state.error && state.amountCrypto !== '';
  }, [state.error, state.amountCrypto]);

  const numericUsdValue = useMemo(() => {
    return state.amountUsd ? parseFloat(state.amountUsd) : null;
  }, [state.amountUsd]);

  return {
    // Renamed for clarity
    amountCrypto: state.amountCrypto,
    amountUsd: state.amountUsd,
    isUsdMode: state.isUsdMode,
    error: state.error,
    isValid,
    conversionDisplay,
    numericUsdValue,
    // Expose both handlers explicitly
    handleCryptoChange,
    handleUsdChange,
    toggleMode,
    setMaxAmount,
    // Legacy compatibility (can be removed after updating consumers)
    amount: state.amountCrypto,
    usdValue: state.amountUsd,
    handleAmountChange: state.isUsdMode ? handleUsdChange : handleCryptoChange,
  };
}
