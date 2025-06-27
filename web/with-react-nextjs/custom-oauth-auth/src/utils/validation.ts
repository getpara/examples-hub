export function isValidOAuthMethod(method: string): boolean {
  const validMethods = ["GOOGLE", "TWITTER", "APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "TELEGRAM"];
  return validMethods.includes(method);
}