export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const CHAIN_ID = "provider";
export const FAUCET_ADDRESS = "cosmos1qdvzqujxqd0pqwcdtpxgfcqcvxn777ka3xmn4u";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}
