import type { CountryCodeOption } from "@/types/auth";

export const COUNTRY_CODES = [
  { code: "+1", label: "US/CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+49", label: "DE (+49)" },
  { code: "+33", label: "FR (+33)" },
  { code: "+81", label: "JP (+81)" },
  { code: "+86", label: "CN (+86)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+55", label: "BR (+55)" },
  { code: "+52", label: "MX (+52)" },
] satisfies CountryCodeOption[];
