import { useState, useCallback, useEffect } from 'react';
import { SupportedWalletType } from '@/types';
import {
  validateRecipientAddress,
  getNetworkPlaceholder,
  getNetworkDisplayName,
} from '@/utils';

interface UseRecipientInputProps {
  networkType: SupportedWalletType;
  externalError?: string;
}

export function useRecipientInput({
  networkType,
  externalError,
}: UseRecipientInputProps) {
  const [address, setAddress] = useState('');
  const [validationResult, setValidationResult] = useState({
    isValid: false,
    errorMessage: '',
  });

  // Validate address whenever it changes or network type changes
  useEffect(() => {
    const result = validateRecipientAddress(address, networkType);
    setValidationResult(result);
  }, [address, networkType]);

  // Handle address change
  const handleAddressChange = useCallback((newAddress: string) => {
    setAddress(newAddress);
  }, []);

  // Clear address
  const clearAddress = useCallback(() => {
    setAddress('');
  }, []);

  // Network-specific placeholder - direct lookup, no memoization needed
  const placeholder = getNetworkPlaceholder(networkType);

  // Network display name - direct lookup, no memoization needed
  const networkName = getNetworkDisplayName(networkType);

  // Combined error message (validation error or external error)
  const errorMessage =
    externalError ||
    (address && !validationResult.isValid ? validationResult.errorMessage : '');

  // Check if there's any error
  const hasError = !!errorMessage;

  // Success message
  const successMessage =
    address && validationResult.isValid ? `Valid ${networkName} address` : '';

  return {
    // State
    address,
    isValid: validationResult.isValid,
    hasError,
    errorMessage,
    successMessage,
    placeholder,
    networkName,

    // Actions
    handleAddressChange,
    clearAddress,
  };
}
