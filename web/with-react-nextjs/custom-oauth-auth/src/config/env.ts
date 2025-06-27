import { PARA_API_KEY } from "@/config/constants";

export function validateEnv() {
  if (!PARA_API_KEY) {
    throw new Error(
      "API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables."
    );
  }
}