export const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? "";
export const THIRDWEB_CLIENT_ID_ERROR =
  "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not configured. Add it to your environment to use Thirdweb features.";

if (!THIRDWEB_CLIENT_ID) {
  console.warn("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Thirdweb features will not work.");
}
