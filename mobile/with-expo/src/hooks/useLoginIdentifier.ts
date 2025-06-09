import { useState, useCallback, useMemo } from "react";
import { AuthType } from "@/types";
import {
  formatPhoneNumberWithCountryCode,
  validateEmail,
  validatePhoneNumber,
  determineInputType,
} from "@/utils/loginIdentifierUtils";

export function useLoginIdentifier(initialCountryCode: string = "+1") {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [inputType, setInputType] = useState<AuthType>("email");
  const [error, setError] = useState("");

  // Calculate display value based on input type
  const displayValue = useMemo(() => {
    return inputType === "email"
      ? email
      : formatPhoneNumberWithCountryCode(phoneNumber, countryCode);
  }, [inputType, email, phoneNumber, countryCode]);

  // Handle input changes
  const handleChange = useCallback((newValue: string) => {
    // Handle backspace
    if (newValue.length < displayValue.length) {
      if (inputType === "phone") {
        const newRaw = phoneNumber.slice(0, -1);
        if (newRaw.length === 0) {
          setPhoneNumber("");
          setInputType("email");
          return;
        }
        setPhoneNumber(newRaw);
      } else {
        setEmail(newValue);
      }
      return;
    }

    // Handle new character
    const newChar = newValue.charAt(newValue.length - 1);
    const detectedType = determineInputType(newValue);

    if (detectedType !== inputType && detectedType !== "") {
      setInputType(detectedType);

      if (detectedType === "email") {
        setEmail(newValue);
      } else if (detectedType === "phone") {
        const digitsOnly = (phoneNumber + newChar).replace(/\D/g, "");
        setPhoneNumber(digitsOnly);
      }
    } else {
      if (inputType === "phone") {
        if (/\d/.test(newChar)) {
          const updatedRaw = phoneNumber + newChar;
          setPhoneNumber(updatedRaw);
        }
      } else {
        setEmail(newValue);
      }
    }
  }, [displayValue, inputType, phoneNumber]);

  // Validate current input
  const validate = useCallback((): boolean => {
    let validationError = "";

    if (inputType === "email") {
      validationError = validateEmail(email);
    } else if (inputType === "phone") {
      validationError = validatePhoneNumber(phoneNumber, countryCode);
    } else {
      validationError = "Could not determine input type. Please enter a valid email or phone.";
    }

    setError(validationError);
    return !validationError;
  }, [inputType, email, phoneNumber, countryCode]);

  // Reset the form
  const reset = useCallback(() => {
    setEmail("");
    setPhoneNumber("");
    setInputType("email");
    setError("");
  }, []);

  // Get the current value based on input type
  const getValue = useCallback(() => {
    return inputType === "email" ? email : countryCode + phoneNumber;
  }, [inputType, email, phoneNumber, countryCode]);

  return {
    // State
    displayValue,
    inputType,
    email,
    phoneNumber,
    countryCode,
    error,
    isValid: !error && displayValue.trim() !== "",

    // Actions
    handleChange,
    setCountryCode,
    validate,
    reset,
    getValue,
  };
}