import { AuthCreds } from "@/types";

export function paramsToCreds(p: {
  authType: "email" | "phone";
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
}): AuthCreds | null {
  if (p.authType === "email" && p.email) {
    return { type: "email", email: p.email };
  }
  if (p.authType === "phone" && p.phoneNumber && p.countryCode) {
    return { type: "phone", phone: p.phoneNumber, countryCode: p.countryCode };
  }
  return null;
}

export function credsToParaAuth(c: AuthCreds): { email: string } | { phone: string; countryCode: string } {
  return c.type === "email" ? { email: c.email } : { phone: c.phone, countryCode: c.countryCode };
}

export function buildPasskeyArgs(c: AuthCreds, biometricsId: string) {
  return { biometricsId, ...credsToParaAuth(c) };
}
