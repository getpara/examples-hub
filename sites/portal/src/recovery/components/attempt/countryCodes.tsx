import { IconType } from '@getpara/core-components';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

const excludedCountries = [
  'AC',
  'CG',
  'CI',
  'CV',
  'GF',
  'GP',
  'MF',
  'NC',
  'PM',
  'RE',
  'SD',
  'SH',
  'SJ',
  'TA',
  'VA',
  'WF',
  'XK',
  'YT',
];

const generateCountryCodes = (): Array<{ label: string; value: string; selectedLabel: string; icon: IconType }> => {
  const countries = getCountries();
  const countryList = countries
    .filter(country => !excludedCountries.includes(country))
    .map(country => {
      const countryCode = getCountryCallingCode(country);
      const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country);
      return {
        label: countryName,
        value: `+${countryCode}`,
        selectedLabel: country,
        icon: country as IconType,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return countryList;
};

const countryCodes = generateCountryCodes();

export default countryCodes;
