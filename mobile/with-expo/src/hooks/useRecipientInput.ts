import { useState, useCallback, useEffect, useMemo } from "react";
import { SupportedWalletType } from "@/types";
import {
  validateRecipientAddress,
  getNetworkPlaceholder,
  getNetworkDisplayName,
} from "@/utils/recipientUtils";

interface UseRecipientInputProps {
  networkType: SupportedWalletType;
  externalError?: string;
}

export function useRecipientInput({ networkType, externalError }: UseRecipientInputProps) {
  const [address, setAddress] = useState("");
  const [validationResult, setValidationResult] = useState({ isValid: false, errorMessage: "" });

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
    setAddress("");
  }, []);

  // Network-specific placeholder
  const placeholder = useMemo(() => {
    return getNetworkPlaceholder(networkType);
  }, [networkType]);

  // Network display name
  const networkName = useMemo(() => {
    return getNetworkDisplayName(networkType);
  }, [networkType]);

  // Combined error message (validation error or external error)
  const errorMessage = useMemo(() => {
    if (externalError) return externalError;
    if (address && !validationResult.isValid) return validationResult.errorMessage;
    return "";
  }, [externalError, address, validationResult]);

  // Check if there's any error
  const hasError = useMemo(() => {
    return !!errorMessage;
  }, [errorMessage]);

  // Success message
  const successMessage = useMemo(() => {
    return address && validationResult.isValid ? `Valid ${networkName} address` : "";
  }, [address, validationResult.isValid, networkName]);

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