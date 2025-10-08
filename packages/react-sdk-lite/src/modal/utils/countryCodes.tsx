import { IconType } from '@getpara/core-components';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

const excludedCountries = [
  'AC',
  'AF',
  'AO',
  'AZ',
  'BD',
  'BO',
  'CG',
  'CI',
  'CV',
  'DZ',
  'ER',
  'ET',
  'GE',
  'GF',
  'GG',
  'GH',
  'GP',
  'ID',
  'IQ',
  'JE',
  'JO',
  'KG',
  'KH',
  'KZ',
  'LA',
  'LK',
  'LS',
  'LY',
  'MA',
  'MF',
  'MG',
  'MM',
  'NC',
  'NG',
  'NP',
  'OM',
  'PK',
  'PM',
  'PS',
  'RE',
  'RU',
  'RW',
  'SD',
  'SH',
  'SJ',
  'TA',
  'TJ',
  'TM',
  'TN',
  'UG',
  'UZ',
  'VA',
  'VN',
  'WF',
  'XK',
  'YE',
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
        label: countryName ?? '',
        value: `+${countryCode}`,
        selectedLabel: country,
        icon: country as IconType,
      };
    })
    .sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''));

  return countryList;
};

const countryCodes = generateCountryCodes();

export default countryCodes;
