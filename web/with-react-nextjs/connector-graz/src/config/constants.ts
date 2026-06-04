export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}
