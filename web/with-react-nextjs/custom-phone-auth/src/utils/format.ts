import { formatPhoneNumber as paraFormatPhoneNumber } from "@getpara/web-sdk";

export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatPhoneNumber(phoneNumber: string, countryCode: string): string | null {
  return paraFormatPhoneNumber(phoneNumber, countryCode);
}

export function formatPhoneDisplay(phoneNumber: string, countryCode: string): string {
  const formatted = formatPhoneNumber(phoneNumber, countryCode);
  if (!formatted) return `${countryCode} ${phoneNumber}`;
  
  // Add spacing for better readability
  const withoutCountryCode = formatted.replace(countryCode, "").trim();
  return `${countryCode} ${withoutCountryCode}`;
}