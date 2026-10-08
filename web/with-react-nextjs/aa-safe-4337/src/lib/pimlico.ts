export const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? "";

if (!PIMLICO_API_KEY) {
  console.warn("NEXT_PUBLIC_PIMLICO_API_KEY is not set. Safe sponsored transactions will not work.");
}
