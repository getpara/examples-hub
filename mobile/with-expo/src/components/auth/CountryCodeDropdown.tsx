import { CountryCodeDropdownProps, CountryOption } from "@/types";
import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import * as countryCodes from "country-codes-list";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

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

  const handleSelect = (dialCode: string) => {
    onChange(dialCode);
  };

  return (
    <DropdownMenu className="w-full h-full flex items-center justify-center">
      <DropdownMenuTrigger className="w-full h-full flex items-center justify-center">
        <Text className="text-base text-foreground">{value}</Text>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {countryOptions.map((option) => (
          <DropdownMenuItem
            key={option.isoCode}
            onPress={() => handleSelect(option.dialCode)}>
            <View className="flex-row items-center">
              <CountryFlag
                isoCode={option.isoCode}
                size={24}
              />
              <Text className="ml-2">
                {option.name} ({option.dialCode})
              </Text>
            </View>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
