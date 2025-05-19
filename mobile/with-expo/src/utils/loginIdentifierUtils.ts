import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";

export function formatPhoneNumberWithCountryCode(phoneNumber: string, countryCode: string): string {
  if (!phoneNumber) return "";

  const countryCodeWithoutPlus = countryCode.replace("+", "");
  const formatter = new AsYouType({ defaultCallingCode: countryCodeWithoutPlus });
  return formatter.input(phoneNumber);
}

export function validateEmail(email: string): string {
  if (!email.trim()) {
    return "Please enter your email address";
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;

  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }

  return "";
}

export function validatePhoneNumber(phoneNumber: string, countryCode: string): string {
  if (!phoneNumber.trim()) {
    return "Please enter your phone number";
  }

  try {
    const fullNumber = countryCode + phoneNumber;
    const parsedPhoneNumber = parsePhoneNumberFromString(fullNumber);
    const isValid = parsedPhoneNumber?.isValid() ?? false;

    if (!isValid) {
      return "Please enter a valid phone number for this country";
    }

    return "";
  } catch (error) {
    return "Please enter a valid phone number";
  }
}

export function determineInputType(text: string): "email" | "phone" | "" {
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
}
