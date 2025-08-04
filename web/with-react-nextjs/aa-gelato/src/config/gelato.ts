export const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY || "";

if (!GELATO_API_KEY) {
  console.warn(
    "GELATO_API_KEY is not defined. Please set NEXT_PUBLIC_GELATO_API_KEY in your environment variables."
  );
}