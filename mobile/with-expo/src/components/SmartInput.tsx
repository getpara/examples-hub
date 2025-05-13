import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Mail, ChevronRight, AlertCircle } from "@/components/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

import { CountryCodeDropdown } from "./CountryCodeDropdown";
import { SmartInputProps } from "@/types";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";

export function SmartInput({
  inputType,
  onInputTypeChange,
  onSubmit,
  placeholder = "Enter email or phone number",
  label = "Email or phone number",
  email = "",
  onEmailChange,
  phoneNumber = "",
  countryCode = "+1",
  onPhoneNumberChange,
  onCountryCodeChange,
}: SmartInputProps) {
  const [error, setError] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [rawValue, setRawValue] = useState("");
  const [previousInputType, setPreviousInputType] = useState(inputType);

  const emailStrictReg = useMemo(
    () =>
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i,
    []
  );
  3;

  const formatPhoneNumber = (digits: string) => {
    const countryCodeWithoutPlus = countryCode.replace("+", "");
    const formatter = new AsYouType({ defaultCallingCode: countryCodeWithoutPlus });
    return formatter.input(digits);
  };

  useEffect(() => {
    if (inputType === "email" && email) {
      setRawValue(email);
      setDisplayValue(email);
    } else if (inputType === "phone" && phoneNumber) {
      const numericValue = phoneNumber.replace(/\D/g, "");
      setRawValue(numericValue);
      setDisplayValue(formatPhoneNumber(numericValue));
    }
  }, []);

  useEffect(() => {
    if (inputType !== previousInputType) {
      if (inputType === "phone" && previousInputType === "email") {
        const numericValue = rawValue.replace(/\D/g, "");
        if (numericValue) {
          setDisplayValue(formatPhoneNumber(numericValue));
        }
      } else if (inputType === "email" && previousInputType === "phone") {
        setDisplayValue(rawValue);
      }

      setPreviousInputType(inputType);
    }
  }, [inputType, previousInputType, rawValue, countryCode]);

  const determineInputType = (text: string): "email" | "phone" | "" => {
    const raw = text.trim();
    if (raw === "") return "";

    const hasAtSymbol = raw.includes("@");
    const hasLetters = /[a-zA-Z]/.test(raw);
    const phoneCharsOnly = /^[\d\s+\-\(\)\.]+$/.test(raw);
    const digitCount = (raw.match(/\d/g) || []).length;

    if (hasAtSymbol || (hasLetters && !phoneCharsOnly)) {
      return "email";
    } else if (digitCount >= 4 && phoneCharsOnly) {
      return "phone";
    } else if (hasLetters) {
      return "email";
    } else if (phoneCharsOnly && digitCount > 0) {
      return "phone";
    }

    return "email";
  };

  const handleChange = (newValue: string) => {
    if (error) {
      setError("");
    }

    if (newValue.length < displayValue.length) {
      if (inputType === "phone") {
        if (displayValue.length > 0 && newValue.length === displayValue.length - 1) {
          const lastChar = displayValue[displayValue.length - 1];
          if (!/\d/.test(lastChar)) {
            const newRaw = rawValue.slice(0, -1);
            setRawValue(newRaw);
            setDisplayValue(formatPhoneNumber(newRaw));
            onPhoneNumberChange?.(formatPhoneNumber(newRaw));
            return;
          }
        }

        const newRaw = rawValue.slice(0, -1);
        setRawValue(newRaw);

        if (newRaw.length === 0) {
          setDisplayValue("");
          onPhoneNumberChange?.("");
          onInputTypeChange("email");
          return;
        }

        setDisplayValue(formatPhoneNumber(newRaw));
        onPhoneNumberChange?.(formatPhoneNumber(newRaw));
        return;
      } else {
        setRawValue(newValue);
        setDisplayValue(newValue);
        onEmailChange?.(newValue);
        return;
      }
    }

    const newChar = newValue.charAt(newValue.length - 1);

    const newInputType = determineInputType(newValue);

    if (newInputType !== inputType && newInputType !== "") {
      onInputTypeChange(newInputType);

      if (newInputType === "email") {
        const updatedRaw = rawValue + newChar;
        setRawValue(updatedRaw);
        setDisplayValue(updatedRaw);
        onEmailChange?.(updatedRaw);
      } else if (newInputType === "phone") {
        const digitsOnly = (rawValue + newChar).replace(/\D/g, "");
        setRawValue(digitsOnly);
        const formatted = formatPhoneNumber(digitsOnly);
        setDisplayValue(formatted);
        onPhoneNumberChange?.(formatted);
      }
    } else {
      if (inputType === "phone") {
        if (/\d/.test(newChar)) {
          const updatedRaw = rawValue + newChar;
          setRawValue(updatedRaw);
          const formatted = formatPhoneNumber(updatedRaw);
          setDisplayValue(formatted);
          onPhoneNumberChange?.(formatted);
        }
      } else {
        setRawValue(newValue);
        setDisplayValue(newValue);
        onEmailChange?.(newValue);
      }
    }
  };

  const handleSubmit = () => {
    if (inputType === "email") {
      if (rawValue.trim() === "") {
        setError("Please enter your email address");
        return;
      }

      if (!emailStrictReg.test(rawValue.trim())) {
        setError("Please enter a valid email address");
        return;
      }
    } else if (inputType === "phone") {
      if (rawValue.trim() === "") {
        setError("Please enter your phone number");
        return;
      }

      try {
        const fullNumber = countryCode + rawValue;
        const parsedPhoneNumber = parsePhoneNumberFromString(fullNumber);
        const isValid = parsedPhoneNumber?.isValid() ?? false;

        if (!isValid) {
          setError("Please enter a valid phone number for this country");
          return;
        }
      } catch (error) {
        setError("Please enter a valid phone number");
        return;
      }
    } else {
      setError("Could not determine input type. Please enter a valid email or phone.");
      return;
    }

    setError("");
    onSubmit();
  };

  const handleCountryCodeChange = (code: string) => {
    onCountryCodeChange?.(code);

    // When country code changes, reformat the phone number
    if (inputType === "phone" && rawValue) {
      const formatted = formatPhoneNumber(rawValue);
      setDisplayValue(formatted);
      onPhoneNumberChange?.(formatted);
    }
  };

  const showSubmitButton = displayValue.trim() !== "";

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

        {showSubmitButton && (
          <View className="flex h-full items-center justify-center pr-2">
            <Button
              size="icon"
              variant="default"
              onPress={handleSubmit}
              accessibilityLabel="Continue"
              className="flex h-10 w-10 items-center justify-center rounded-md bg-primary p-0">
              <ChevronRight
                size={20}
                className="text-primary-foreground"
              />
            </Button>
          </View>
        )}
      </View>

      {displayValue !== "" && inputType !== undefined && !error && (
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
