export type AuthTab = "email" | "phone" | "social";

export interface CountryCodeOption {
  code: string;
  label: string;
}

export interface OAuthProviderOption {
  method: string;
  label: string;
  icon: string;
}
