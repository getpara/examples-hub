export type OAuthProviderMethod = "GOOGLE" | "APPLE" | "DISCORD" | "TWITTER";

export interface OAuthProviderOption {
  method: OAuthProviderMethod;
  label: string;
  icon: string;
}
