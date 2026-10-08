export const PARA_API_KEY_VARIABLE = "NEXT_PUBLIC_PARA_API_KEY";

export function isParaApiKeyConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_PARA_API_KEY);
}
