import { Language } from '../type';
import * as CountryLanguage from '@ladjs/country-language';

export const countryCodeToLanguage = (countryCode: string) => {
  let languageCode =
    CountryLanguage.getCountryLanguages(countryCode)?.[0]?.iso639_1;

  switch (countryCode) {
    case 'KR':
      languageCode = Language.ko;
      break;
    case 'UK':
    case 'GB':
    case 'US':
    case 'USA':
    case 'CA':
      languageCode = Language.en;
      break;
    default:
      languageCode = Language.en;
      break;
  }

  return languageCode;
};

export const countryNameToCode = (name: string): string | null => {
  const allCountries = CountryLanguage.getCountries();

  return (
    allCountries.find((item) =>
      [item.name, item.code_2, item.code_3, item.numCode].includes(name),
    )?.code_2 ?? null
  );
};
