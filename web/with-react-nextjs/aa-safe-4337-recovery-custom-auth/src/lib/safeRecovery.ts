export const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;
export const SOCIAL_RECOVERY_MODULE_ADDRESS = "0x949d01d424bE050D09C16025dd007CB59b3A8c66" as const;
export const SAFE_VERSION = "1.4.1";
export const GUARDIAN_THRESHOLD = BigInt(1);

export const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? "";

if (!PIMLICO_API_KEY) {
  console.warn("NEXT_PUBLIC_PIMLICO_API_KEY is not set. Sponsored Safe operations will not work.");
}
