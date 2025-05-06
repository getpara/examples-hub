import { CountryCodeDropdownProps, CountryOption } from "@/types";
import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import * as countryCodes from "country-codes-list";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function CountryCodeDropdown({ value, onChange }: CountryCodeDropdownProps) {
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);

  useEffect(() => {
    const allCountries = countryCodes.all();

    const topCountryCodes = ["US", "GB", "CA", "AU", "IN"];

    const options = allCountries
      .filter((country) => topCountryCodes.includes(country.countryCode))
      .map((country) => ({
        dialCode: `+${country.countryCallingCode}`,
        name: country.countryNameEn,
        isoCode: country.countryCode.toLowerCase(),
      }));

    options.sort((a, b) => a.name.localeCompare(b.name));

    setCountryOptions(options);
  }, []);

  const handleSelect = (option: { value: string; label: string } | undefined) => {
    if (option) {
      onChange(option.value);
    }
  };

  const selectedOption = countryOptions.find((option) => option.dialCode === value);
  const currentValue = selectedOption
    ? {
        value: selectedOption.dialCode,
        label: `${selectedOption.name} (${selectedOption.dialCode})`,
      }
    : undefined;

  return (
    <Select
      value={currentValue}
      onValueChange={handleSelect}>
      <SelectTrigger className="w-full h-full">
        <SelectValue
          className="text-base text-foreground"
          placeholder="Select country code"
        />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectGroup>
          {countryOptions.map((option) => (
            <SelectItem
              key={option.isoCode}
              label={`${option.name} (${option.dialCode})`}
              value={option.dialCode}>
              <View className="flex-row items-center">
                <CountryFlag
                  isoCode={option.isoCode}
                  size={24}
                />
                <Text className="ml-2">
                  {option.name} ({option.dialCode})
                </Text>
              </View>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
