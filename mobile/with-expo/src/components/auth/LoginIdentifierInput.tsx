import React from "react";
import { View } from "react-native";
import { Mail, ChevronRight, AlertCircle } from "@/components/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { CountryCodeDropdown } from "./CountryCodeDropdown";
import { AuthType, CountryOption } from "@/types";
import {
  formatPhoneNumberWithCountryCode,
  validateEmail,
  validatePhoneNumber,
  determineInputType,
} from "@/utils/loginIdentifierUtils";

interface LoginIdentifierInputProps {
  inputType: AuthType;
  onInputTypeChange: (type: AuthType) => void;
  onSubmit: () => void;
  email: string;
  phoneNumber: string;
  countryCode: string;
  error: string;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  countryOptions: CountryOption[];
  onCountryCodeChange?: (value: string) => void;
  onValidate?: (error: string) => void;
  placeholder?: string;
  label?: string;
  isLoading?: boolean;
}

export function LoginIdentifierInput({
  inputType,
  onInputTypeChange,
  onSubmit,
  onEmailChange,
  onPhoneNumberChange,
  email = "",
  phoneNumber = "",
  countryCode = "+1",
  error = "",
  countryOptions,
  onCountryCodeChange,
  onValidate,
  placeholder = "Enter email or phone number",
  label = "Email or phone number",
  isLoading = false,
}: LoginIdentifierInputProps) {
  const displayValue = inputType === "email" ? email : formatPhoneNumberWithCountryCode(phoneNumber, countryCode);

  const handleChange = (newValue: string) => {
    if (newValue.length < displayValue.length) {
      handleBackspace(newValue);
      return;
    }

    const newChar = newValue.charAt(newValue.length - 1);

    const detectedType = determineInputType(newValue);
    if (detectedType !== inputType && detectedType !== "") {
      onInputTypeChange(detectedType);

      if (detectedType === "email") {
        onEmailChange(newValue);
      } else if (detectedType === "phone") {
        const digitsOnly = (phoneNumber + newChar).replace(/\D/g, "");
        onPhoneNumberChange(digitsOnly);
      }
    } else {
      if (inputType === "phone") {
        if (/\d/.test(newChar)) {
          const updatedRaw = phoneNumber + newChar;
          onPhoneNumberChange(updatedRaw);
        }
      } else {
        onEmailChange(newValue);
      }
    }
  };

  const handleBackspace = (newValue: string) => {
    if (inputType === "phone") {
      const newRaw = phoneNumber.slice(0, -1);

      if (newRaw.length === 0) {
        onPhoneNumberChange("");
        onInputTypeChange("email");
        return;
      }

      onPhoneNumberChange(newRaw);
    } else {
      onEmailChange(newValue);
    }
  };

  const handleSubmit = () => {
    let validationError = "";
    if (inputType === "email") {
      validationError = validateEmail(email);
    } else if (inputType === "phone") {
      validationError = validatePhoneNumber(phoneNumber, countryCode);
    } else {
      validationError = "Could not determine input type. Please enter a valid email or phone.";
    }
    if (onValidate) {
      onValidate(validationError);
    }
    if (!validationError) {
      onSubmit();
    }
  };

  const handleCountryCodeChange = (code: string) => {
    onCountryCodeChange?.(code);
  };

  const showHelperText = displayValue.trim() !== "" && inputType !== undefined && !error;

  return (
    <View className="gap-y-2">
      <Text
        accessibilityRole="text"
        className="text-sm font-medium text-foreground native:text-base">
        {label}
      </Text>
      <View className="flex-row h-14 rounded-lg border border-border bg-white items-center">
        <View className="h-full w-16 flex items-center justify-center border-r border-border">
          {inputType === "email" ? (
            <Mail
              size={24}
              className="text-muted-foreground"
            />
          ) : inputType === "phone" ? (
            <CountryCodeDropdown
              value={countryCode}
              onChange={handleCountryCodeChange}
              countryOptions={countryOptions}
            />
          ) : null}
        </View>

        <Input
          value={displayValue}
          onChangeText={handleChange}
          placeholder={placeholder}
          keyboardType={inputType === "phone" ? "phone-pad" : "default"}
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 h-14 text-base text-foreground border-0 bg-transparent font-nunito"
          placeholderTextColor="#9CA3AF"
        />

        <View className="flex h-full items-center justify-center pr-2">
          <Button
            size="icon"
            variant="default"
            onPress={handleSubmit}
            accessibilityLabel="Continue"
            disabled={isLoading || displayValue.trim() === ""}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary p-0">
            <ChevronRight
              size={20}
              className="text-primary-foreground"
            />
          </Button>
        </View>
      </View>

      {showHelperText && (
        <Text className="pl-2 text-xs text-muted-foreground">
          {inputType === "phone" ? `Continuing with phone (${countryCode})` : `Continuing with ${inputType}`}
        </Text>
      )}

      {error !== "" && (
        <View className="mt-1 flex-row items-start gap-x-2 rounded-lg bg-destructive/10 p-3">
          <AlertCircle
            size={18}
            className="mt-1 text-destructive"
          />
          <Text className="flex-1 text-sm text-destructive">{error}</Text>
        </View>
      )}
    </View>
  );
}
