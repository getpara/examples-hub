import { AuthCreds, AuthType } from "@/types";

export function paramsToCreds(p: {
  authType: AuthType;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
}): AuthCreds | null {
  if (p.authType === "email" && p.email) {
    return { authType: "email", email: p.email };
  }
  if (p.authType === "phone" && p.phoneNumber && p.countryCode) {
    return { authType: "phone", phone: p.phoneNumber, countryCode: p.countryCode };
  }
  return null;
}

export function credsToParaAuth(c: AuthCreds): { email: string } | { phone: string; countryCode: string } {
  return c.authType === "email" ? { email: c.email } : { phone: c.phone, countryCode: c.countryCode };
}

export function buildPasskeyArgs(
  c: AuthCreds,
  biometricsId: string
): { biometricsId: string; email: string } | { biometricsId: string; phone: string; countryCode: string } {
  return { biometricsId, ...credsToParaAuth(c) };
}
