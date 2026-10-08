export const OAUTH_PROVIDERS = [
  { id: "GOOGLE", label: "Google", markSrc: "/marks/google-brand.svg" },
  { id: "APPLE", label: "Apple", markSrc: "/marks/apple.svg" },
  { id: "DISCORD", label: "Discord", markSrc: "/marks/discord-brand.svg" },
  { id: "TWITTER", label: "X", markSrc: "/marks/twitter.svg" },
] as const;

export function getOAuthProviderLabel(id: string | null) {
  return OAUTH_PROVIDERS.find((provider) => provider.id === id)?.label ?? null;
}
