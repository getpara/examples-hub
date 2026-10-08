export const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY ?? "";

if (!GELATO_API_KEY) {
  console.warn("NEXT_PUBLIC_GELATO_API_KEY is not set. Gelato features will not work.");
}
