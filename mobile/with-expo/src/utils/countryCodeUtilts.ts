import * as countryCodes from "country-codes-list";
import { CountryOption } from "@/types";

export function getTopCountryOptions(priorityCodes = ["US", "GB", "CA", "AU", "IN"]): CountryOption[] {
  const allCountries = countryCodes.all();

  const options = allCountries
    .filter((country) => priorityCodes.includes(country.countryCode))
    .map((country) => ({
      dialCode: `+${country.countryCallingCode}`,
      name: country.countryNameEn,
      isoCode: country.countryCode.toLowerCase(),
    }));

  return options.sort((a, b) => a.name.localeCompare(b.name));
}
