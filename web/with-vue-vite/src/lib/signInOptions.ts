export type AuthTab = "email" | "phone" | "social";

export type OAuthProviderId = "GOOGLE" | "APPLE" | "DISCORD" | "TWITTER";

export const AUTH_TABS: ReadonlyArray<{ value: AuthTab; label: string; testId: string }> = [
  { value: "email", label: "Email", testId: "email-tab" },
  { value: "phone", label: "Phone", testId: "phone-tab" },
  { value: "social", label: "Social", testId: "social-tab" },
];

export const COUNTRY_CODES = [
  { value: "+1", label: "US/CA (+1)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+49", label: "DE (+49)" },
  { value: "+33", label: "FR (+33)" },
  { value: "+81", label: "JP (+81)" },
  { value: "+86", label: "CN (+86)" },
  { value: "+91", label: "IN (+91)" },
  { value: "+61", label: "AU (+61)" },
  { value: "+55", label: "BR (+55)" },
  { value: "+52", label: "MX (+52)" },
] as const;

export const OAUTH_PROVIDERS: ReadonlyArray<{ id: OAuthProviderId; label: string; markSrc: string }> = [
  { id: "GOOGLE", label: "Google", markSrc: "/marks/google-brand.svg" },
  { id: "APPLE", label: "Apple", markSrc: "/marks/apple.svg" },
  { id: "DISCORD", label: "Discord", markSrc: "/marks/discord-brand.svg" },
  { id: "TWITTER", label: "X", markSrc: "/marks/twitter.svg" },
];
