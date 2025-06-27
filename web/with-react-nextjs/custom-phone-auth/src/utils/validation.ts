export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  
  // Phone number should have at least 4 digits and at most 15 digits
  return digitsOnly.length >= 4 && digitsOnly.length <= 15;
}

export function isValidCountryCode(countryCode: string): boolean {
  // Country code should start with + and have 1-4 digits
  const pattern = /^\+\d{1,4}$/;
  return pattern.test(countryCode);
}

export function isValidOTP(otp: string): boolean {
  // OTP should be exactly 6 digits
  return /^\d{6}$/.test(otp);
}