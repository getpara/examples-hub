import type { OAuthProviderOption } from "@/types/auth";

export const OAUTH_PROVIDERS = [
  { method: "GOOGLE", label: "Google", icon: "/google.svg" },
  { method: "APPLE", label: "Apple", icon: "/apple.svg" },
  { method: "DISCORD", label: "Discord", icon: "/discord.svg" },
  { method: "TWITTER", label: "X", icon: "/twitter.svg" },
] satisfies OAuthProviderOption[];
