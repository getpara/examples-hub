import React from "react";
import { View } from "react-native";
import { Mail, ChevronRight, AlertCircle } from "@/components/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { CountryCodeDropdown } from "./CountryCodeDropdown";
import { AuthType, CountryOption } from "@/types";

interface LoginIdentifierInputProps {
  displayValue: string;
  inputType: AuthType;
  countryCode: string;
  error: string;
  isValid: boolean;
  showHelperText: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCountryCodeChange: (value: string) => void;
  countryOptions: CountryOption[];
  placeholder?: string;
  label?: string;
  isLoading?: boolean;
}

export function LoginIdentifierInput({
  displayValue,
  inputType,
  countryCode,
  error,
  isValid,
  showHelperText,
  onChange,
  onSubmit,
  onCountryCodeChange,
  countryOptions,
  placeholder = "Enter email or phone number",
  label = "Email or phone number",
  isLoading = false,
}: LoginIdentifierInputProps) {

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
              onChange={onCountryCodeChange}
              countryOptions={countryOptions}
            />
          ) : null}
        </View>

        <Input
          value={displayValue}
          onChangeText={onChange}
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
            onPress={onSubmit}
            accessibilityLabel="Continue"
            disabled={isLoading || !isValid}
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
