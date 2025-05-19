import { CountryCodeDropdownProps, CountryOption } from "@/types";
import React from "react";
import { Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

export function CountryCodeDropdown({
  value,
  onChange,
  countryOptions,
}: CountryCodeDropdownProps & { countryOptions: CountryOption[] }) {
  return (
    <DropdownMenu className="w-full h-full flex items-center justify-center">
      <DropdownMenuTrigger className="w-full h-full flex items-center justify-center">
        <Text className="text-base text-foreground">{value}</Text>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {countryOptions.map((option) => (
          <DropdownMenuItem
            key={option.isoCode}
            onPress={() => onChange(option.dialCode)}>
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
